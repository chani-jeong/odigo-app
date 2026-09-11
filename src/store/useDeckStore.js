import { create } from 'zustand';
import { db, auth, analytics } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { logEvent } from 'firebase/analytics';
import popupsData from '../data/popups.sample.json';
import { buildActiveDeckOrder } from '../utils/buildDeckOrder';

const shouldExcludeSeen = () =>
  !!(auth.currentUser && !auth.currentUser.isAnonymous);

const deckFieldsFrom = (state, { resetIndex = true } = {}) => {
  const deckOrder = buildActiveDeckOrder(state.events || [], {
    userInterests: state.userInterests,
    seenPopupIds: state.seenPopups,
    excludeSeen: shouldExcludeSeen(),
  });
  return resetIndex ? { deckOrder, currentIndex: 0 } : { deckOrder };
};

const useDeckStore = create((set, get) => ({
  userId: null,
  events: [],
  isLoading: false,
  deckOrder: [],
  currentIndex: 0,
  likes: [],
  passes: [],
  halalOn: false,
  veganOn: false,
  selectedPopup: null,
  savedPopups: [],
  visitedPopups: [],
  seenPopups: [],
  hasCompletedOnboarding: false,
  selectedLanguage: 'en',
  userCountry: '',
  userInterests: [],
  userLocation: null,
  hasAgreedToLocation: false,
  shareModalPopupId: null,
  sharedPopupsSession: [],

  // Onboarding & Location Actions
  setAgreedToLocation: () => set({ hasAgreedToLocation: true }),
  setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
  setCountry: (country) => set({ userCountry: country }),
  setLanguage: (lang) => set({ selectedLanguage: lang }),
  openShareModal: (popupId) => set({ shareModalPopupId: popupId }),
  closeShareModal: () => set({ shareModalPopupId: null }),
  toggleInterest: (interest) => {
    const state = get();
    const isAdding = !state.userInterests.includes(interest);
    
    if (isAdding) {
      try {
        if (analytics) logEvent(analytics, 'select_interest', { interest: interest });
      } catch (e) {
        console.error('Analytics error:', e);
      }
    }
    
    set({
      userInterests: isAdding
        ? [...state.userInterests, interest]
        : state.userInterests.filter((i) => i !== interest),
    });
  },
  completeOnboarding: () => {
    const state = get();
    const { userCountry, selectedLanguage, userInterests } = state;
    set({
      hasCompletedOnboarding: true,
      ...deckFieldsFrom(state, { resetIndex: true }),
    });
    
    // 로그인/익명 상관없이 uid가 있으면 Firestore에 저장
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      setDoc(userRef, {
        hasCompletedOnboarding: true,
        userCountry,
        selectedLanguage,
        userInterests,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(err => console.error('completeOnboarding Firestore error:', err));
    }
  },

  // Actions
  toggleSave: (popupId) => {
    const { userId, savedPopups } = get();
    const isSaved = savedPopups.includes(popupId);
    
    if (!isSaved) {
      try {
        if (analytics) logEvent(analytics, 'save_popup', { popup_id: popupId });
      } catch (e) {
        console.error('Analytics error:', e);
      }
    }

    // 로컬 상태 즉시 업데이트
    set({
      savedPopups: isSaved 
        ? savedPopups.filter((id) => id !== popupId)
        : [...savedPopups, popupId],
    });

    // Firestore 백그라운드 업데이트
    if (userId) {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, {
        savedPopups: isSaved ? arrayRemove(popupId) : arrayUnion(popupId)
      }).catch(err => console.error('Failed to update savedPopups in Firestore:', err));
    }
  },

  toggleVisited: (popupId) => {
    const { userId, visitedPopups } = get();
    const isVisited = visitedPopups.includes(popupId);

    // 로컬 상태 즉시 업데이트
    set({
      visitedPopups: isVisited
        ? visitedPopups.filter((id) => id !== popupId)
        : [...visitedPopups, popupId],
    });

    // Share Modal 로직: 처음 방문 처리할 때 (세션당 한 번만) 모달 띄우기
    if (!isVisited) {
      const { sharedPopupsSession, openShareModal } = get();
      if (!sharedPopupsSession.includes(popupId)) {
        set({ sharedPopupsSession: [...sharedPopupsSession, popupId] });
        setTimeout(() => {
          openShareModal(popupId);
        }, 500); // UI transition delay (like a checkmark animation if any)
      }
    }

    // Firestore 백그라운드 업데이트
    if (userId) {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        visitedPopups: isVisited ? arrayRemove(popupId) : arrayUnion(popupId)
      };

      // 처음 방문 처리할 때만 visitedLog에 타임스탬프 기록 추가 (취소할 땐 지우지 않음)
      if (!isVisited) {
        updateData.visitedLog = arrayUnion({
          popupId,
          visitedAt: new Date().toISOString()
        });
        
        try {
          if (analytics) logEvent(analytics, 'mark_visited', { popup_id: popupId });
        } catch (e) {
          console.error('Analytics error:', e);
        }
      }

      updateDoc(userRef, updateData)
        .catch(err => console.error('Failed to update visitedPopups in Firestore:', err));
    }
  },

  setEvents: (events) =>
    set((state) => ({
      events,
      ...deckFieldsFrom({ ...state, events }, { resetIndex: true }),
    })),
    
  fetchEvents: async () => {
    const { events } = get();
    // If we already have events, do not overwrite (preserves state across tab switches)
    if (events && events.length > 0) return;
    
    set({ isLoading: true });
    try {
      // Simulate network request if we were using Firestore
      // const snap = await getDocs(collection(db, 'events'));
      // const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const data = popupsData;
      const state = get();
      set({
        events: data,
        ...deckFieldsFrom({ ...state, events: data }, { resetIndex: true }),
      });
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  // 위치는 km 표시 등 다른 화면에 쓰이지만, Discover 덱 순서는 관심사 셔플을 유지한다.
  sortEventsByDistance: () => {},

  like: (id) => set((state) => ({ likes: [...state.likes, id] })),
  pass: (id) => set((state) => ({ passes: [...state.passes, id] })),

  markPopupSeen: (popupId) => {
    if (!popupId) return;
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.isAnonymous) return;

    const { seenPopups } = get();
    if (seenPopups.includes(popupId)) return;

    set({ seenPopups: [...seenPopups, popupId] });

    const userRef = doc(db, 'users', currentUser.uid);
    updateDoc(userRef, { seenPopups: arrayUnion(popupId) })
      .catch((err) => console.error('Failed to update seenPopups in Firestore:', err));
  },

  nextCard: (popupId) => {
    if (popupId) get().markPopupSeen(popupId);
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.deckOrder.length),
    }));
  },

  restartDeck: () => {
    const currentUser = auth.currentUser;
    set((state) => ({
      seenPopups: [],
      ...deckFieldsFrom({ ...state, seenPopups: [] }, { resetIndex: true }),
    }));

    if (currentUser && !currentUser.isAnonymous) {
      const userRef = doc(db, 'users', currentUser.uid);
      updateDoc(userRef, { seenPopups: [] })
        .catch((err) => console.error('Failed to reset seenPopups in Firestore:', err));
    }
  },

  toggleHalal: () => set((state) => ({ halalOn: !state.halalOn })),
  toggleVegan: () => set((state) => ({ veganOn: !state.veganOn })),

  openPopup: (popupId) => {
    try {
      if (analytics) logEvent(analytics, 'view_popup_detail', { popup_id: popupId });
    } catch (e) {
      console.error('Analytics error:', e);
    }
    set({ selectedPopup: popupId });
  },
  closePopup: () => set({ selectedPopup: null }),
}));

export default useDeckStore;

// 앱 초기화 시 Firebase 익명 로그인 및 Firestore 데이터 동기화 (IIFE)
(function initAuth() {
  // SSR 환경 방지
  if (typeof window === 'undefined') return;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // 1. 유저 ID 스토어에 저장
      useDeckStore.setState({ userId: user.uid });
      
      // 2. Firestore에서 기존 데이터 조회
      const userRef = doc(db, 'users', user.uid);
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const update = {
            savedPopups: data.savedPopups || [],
            visitedPopups: data.visitedPopups || [],
            seenPopups: data.seenPopups || [],
          };
          // 온보딩 정보 복원 (익명/비익명 모두 적용)
          if (data.hasCompletedOnboarding) {
            update.hasCompletedOnboarding = true;
          }
          if (data.userCountry) update.userCountry = data.userCountry;
          if (data.selectedLanguage) update.selectedLanguage = data.selectedLanguage;
          if (data.userInterests) update.userInterests = data.userInterests;

          useDeckStore.setState((state) => {
            const next = { ...state, ...update };
            // 스와이프 중간에 Firestore hydrate가 오면 덱을 다시 섞지 않는다
            if (state.events.length > 0 && state.currentIndex === 0) {
              return { ...update, ...deckFieldsFrom(next, { resetIndex: true }) };
            }
            return update;
          });
        } else {
          await setDoc(userRef, { savedPopups: [], visitedPopups: [], seenPopups: [] });
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
      }
    } else {
      // 로그인되어 있지 않으면 익명 로그인 시도
      signInAnonymously(auth).catch((error) => {
        console.error("Anonymous sign in failed:", error);
      });
    }
  });
})();
