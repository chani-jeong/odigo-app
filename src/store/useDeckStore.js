import { create } from 'zustand';

const useDeckStore = create((set, get) => ({
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
  toggleSave: (popupId) => set((state) => ({
    savedPopups: state.savedPopups.includes(popupId)
      ? state.savedPopups.filter((id) => id !== popupId)
      : [...state.savedPopups, popupId],
  })),
  toggleVisited: (popupId) => set((state) => ({
    visitedPopups: state.visitedPopups.includes(popupId)
      ? state.visitedPopups.filter((id) => id !== popupId)
      : [...state.visitedPopups, popupId],
  })),

  setEvents: (events) =>
    set((state) => {
      // If we have userLocation, sort events by distance
      let sortedEvents = [...events];
      if (state.userLocation) {
        import('../utils/distance.js').then(({ getDistanceFromLatLonInKm }) => {
          // Since this is inside set which is sync, we better handle sort outside or trigger it via an action
        });
      }
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
