import { create } from 'zustand';
import { loginWithGoogleFirebase, logoutFirebase, auth } from '../firebase';
import useToastStore from './useToastStore';

const useAuthStore = create((set) => ({
  user: null,
  isAuthModalOpen: false,
  authLoading: false,

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  
  setUser: (user) => set({ user }),

  loginWithGoogle: async () => {
    set({ authLoading: true });
    try {
      const result = await loginWithGoogleFirebase();
      set({ user: result.user, isAuthModalOpen: false, authLoading: false });
      useToastStore.getState().showToast("Logged in successfully!");
    } catch (error) {
      console.error("Login failed", error);
      set({ authLoading: false });
      useToastStore.getState().showToast("Login failed.", "error");
    }
  },

  // Mock functions for other providers
  loginWithWeChat: async () => {
    set({ authLoading: true });
    setTimeout(() => {
      set({ 
        user: { uid: 'wechat-123', displayName: 'WeChat User', email: 'wechat@odigo.app', photoURL: '' }, 
        isAuthModalOpen: false, 
        authLoading: false 
      });
      useToastStore.getState().showToast("Logged in with WeChat!");
    }, 1000);
  },

  logout: async () => {
    await logoutFirebase();
    set({ user: null });
  }
}));

// Initialize auth state listener if using real Firebase
if (auth.onAuthStateChanged) {
  auth.onAuthStateChanged((user) => {
    useAuthStore.getState().setUser(user);
  });
}

export default useAuthStore;
