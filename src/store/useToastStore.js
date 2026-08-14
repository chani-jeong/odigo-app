import { create } from 'zustand';

const useToastStore = create((set) => ({
  toast: null,
  
  showToast: (message, type = 'success', duration = 3000) => {
    set({ toast: { message, type } });
    setTimeout(() => {
      set({ toast: null });
    }, duration);
  },

  hideToast: () => set({ toast: null })
}));

export default useToastStore;
