import { create } from 'zustand';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const useDeckStore = create((set, get) => ({
  userId: null,
  events: [],
  deckOrder: [],
  currentIndex: 0,
  likes: [],
  passes: [],
  halalOn: false,
  veganOn: false,
  selectedPopup: null,
  savedPopups: [],
  visitedPopups: [],
  hasCompletedOnboarding: false,
  selectedLanguage: 'en',
  userCountry: '',
  userInterests: [],
  userLocation: null,
  hasAgreedToLocation: false,

  // Onboarding & Location Actions
  setAgreedToLocation: () => set({ hasAgreedToLocation: true }),
  setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
  setCountry: (country) => set({ userCountry: country }),
  setLanguage: (lang) => set({ selectedLanguage: lang }),
  toggleInterest: (interest) => set((state) => ({
    userInterests: state.userInterests.includes(interest)
      ? state.userInterests.filter((i) => i !== interest)
      : [...state.userInterests, interest],
  })),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),

  // Actions
  toggleSave: (popupId) => {
    const { userId, savedPopups } = get();
    const isSaved = savedPopups.includes(popupId);
    
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

    // Firestore 백그라운드 업데이트
    if (userId) {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, {
        visitedPopups: isVisited ? arrayRemove(popupId) : arrayUnion(popupId)
      }).catch(err => console.error('Failed to update visitedPopups in Firestore:', err));
    }
  },

  setEvents: (events) =>
    set(() => {
      return {
        events,
        deckOrder: events.map((_, i) => i),
        currentIndex: 0,
      };
    }),
  
  sortEventsByDistance: () => set((state) => {
    if (!state.userLocation || state.events.length === 0) return state;
    
    // We need to sync import since state updates must be synchronous
    // We'll calculate distances and map them to deckOrder indices
    // Actually, let's just do it directly here using a simple formula to avoid async import in reducer
    const { lat, lng } = state.userLocation;
    
    const distanceCache = state.events.map((event) => {
      if (!event.location || !event.location.lat) return { id: event.id, dist: 999999 };
      const dLat = (event.location.lat - lat) * (Math.PI/180);
      const dLon = (event.location.lng - lng) * (Math.PI/180);
      // Simplified distance for sorting
      const dist = Math.sqrt(dLat*dLat + dLon*dLon);
      return { id: event.id, dist };
    });

    const newDeckOrder = state.deckOrder.slice().sort((a, b) => {
      const distA = distanceCache[a].dist;
      const distB = distanceCache[b].dist;
      return distA - distB;
    });

    return { deckOrder: newDeckOrder, currentIndex: 0 };
  }),

  like: (id) => set((state) => ({ likes: [...state.likes, id] })),
  pass: (id) => set((state) => ({ passes: [...state.passes, id] })),

  nextCard: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.deckOrder.length - 1),
    })),

  toggleHalal: () => set((state) => ({ halalOn: !state.halalOn })),
  toggleVegan: () => set((state) => ({ veganOn: !state.veganOn })),

  openPopup: (popupId) => set({ selectedPopup: popupId }),
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
          useDeckStore.setState({ 
            savedPopups: data.savedPopups || [], 
            visitedPopups: data.visitedPopups || [] 
          });
        } else {
          // 문서가 없으면 빈 배열로 새로 생성
          await setDoc(userRef, { savedPopups: [], visitedPopups: [] });
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
