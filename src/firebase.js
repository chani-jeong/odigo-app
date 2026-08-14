import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// ----------------------------------------------------------------------
// TODO: Replace these placeholder values with your actual Firebase config!
// ----------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app, auth, googleProvider;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} else {
  // Mock Auth Object for UI Testing
  auth = {
    currentUser: null,
    onAuthStateChanged: (cb) => { 
      cb(null); 
      return () => {}; 
    }
  };
}

export const loginWithGoogleFirebase = async () => {
  if (isConfigured) {
    return signInWithPopup(auth, googleProvider);
  } else {
    // Mock Login Delay for UI Testing
    return new Promise(resolve => {
      setTimeout(() => {
        const mockUser = { 
          uid: 'mock-123', 
          displayName: 'Odigo User', 
          email: 'user@odigo.app', 
          photoURL: 'https://ui-avatars.com/api/?name=Odigo+User&background=59CBB7&color=fff' 
        };
        resolve({ user: mockUser });
      }, 1000);
    });
  }
};

export const logoutFirebase = async () => {
  if (isConfigured) {
    return signOut(auth);
  } else {
    return Promise.resolve();
  }
};

export { auth, isConfigured };
