import { create } from 'zustand';
import { loginWithGoogleFirebase, logoutFirebase, auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import useToastStore from './useToastStore';

const useAuthStore = create((set) => ({
  user: null,
  isAnonymous: true,
  isAuthModalOpen: false,
  authLoading: false,

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  
  setUser: (user) => set({
    user,
    isAnonymous: !user || user.isAnonymous,
  }),

  loginWithGoogle: async () => {
    set({ authLoading: true });
    try {
      const result = await loginWithGoogleFirebase();
      const { uid, displayName, photoURL, email } = result.user;
      // Firestore에 사용자 정보 저장 (upsert)
      await setDoc(doc(db, 'users', uid), {
        displayName: displayName || '',
        photoURL: photoURL || '',
        email: email || '',
        provider: 'google',
        updatedAt: serverTimestamp(),
      }, { merge: true });
      set({ user: result.user, isAnonymous: false, isAuthModalOpen: false, authLoading: false });
      useToastStore.getState().showToast("Logged in successfully!");
    } catch (error) {
      console.error("Login failed", error);
      set({ authLoading: false });
      if (error.code !== 'auth/popup-closed-by-user') {
        useToastStore.getState().showToast("Login failed.", "error");
      }
    }
  },

  loginWithApple: () => {
    useToastStore.getState().showToast("Apple login coming soon!", "info");
  },

  loginWithWeChat: () => {
    useToastStore.getState().showToast("WeChat login coming soon!", "info");
  },

  logout: async () => {
    await logoutFirebase();
    set({ user: null, isAnonymous: true });
  }
}));

// Sync Firebase auth state → store
if (auth.onAuthStateChanged) {
  auth.onAuthStateChanged((user) => {
    useAuthStore.getState().setUser(user);
  });
}

export default useAuthStore;
