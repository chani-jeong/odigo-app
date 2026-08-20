import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD5GpgAKdjrhE3ws8cbEwsfInF9xBsGoB0",
  authDomain: "odigo-c3d76.firebaseapp.com",
  projectId: "odigo-c3d76",
  storageBucket: "odigo-c3d76.firebasestorage.app",
  messagingSenderId: "813033420213",
  appId: "1:813033420213:web:be5e86e4c30044634fd5fc",
  measurementId: "G-PPT8Q8FV9S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export const loginWithGoogleFirebase = async () => {
  return signInWithPopup(auth, googleProvider);
};

export const logoutFirebase = async () => {
  return signOut(auth);
};

export { app, auth, db, analytics, storage };
