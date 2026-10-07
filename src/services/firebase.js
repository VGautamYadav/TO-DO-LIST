import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  enableIndexedDbPersistence
} from 'firebase/firestore';

// Firebase configuration using Vite environment variables or placeholder
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyKeyForInitialization12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "SiMplyDOIT-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "SiMplyDOIT-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "SiMplyDOIT-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Check if valid Firebase credentials are provided
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes("AIzaSyDemoDummyKey")
);

// Initialize Firebase App safely
let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  console.warn("Firebase initialization warning (credentials may need setup):", e);
}

export const auth = app ? getAuth(app) : null;
export let db = null;
if (app) {
  try {
    db = getFirestore(app);
  } catch (err) {
    console.error("Firestore initialization failed. Please check your credentials or network.", err);
  }
}

// Enable offline persistence (TEMPORARILY DISABLED FOR SYNC DIAGNOSTICS)
/*
if (db) {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence.');
    }
  });
}
*/

// Authentication helper methods
export const firebaseAuthService = {
  // Sign up with Email and Password
  async signUp(email, password, displayName = '') {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  },

  // Log in with Email and Password
  async logIn(email, password) {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // Send Password Reset Email directly to user's mail ID
  async resetPassword(email) {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    return await sendPasswordResetEmail(auth, email);
  },

  // Log out
  async logOut() {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    return await signOut(auth);
  },

  // Listen to Auth State Changes
  onAuthChange(callback) {
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  // Send Email Login Link (Passwordless)
  async sendEmailLoginLink(email) {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    const actionCodeSettings = {
      url: window.location.origin, // Use the actual web origin
      handleCodeInApp: true,
    };
    return await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  },

  // Check if URL is an email sign-in link
  isEmailSignInLink(url) {
    if (!auth) return false;
    return isSignInWithEmailLink(auth, url);
  },

  // Complete Email Login
  async completeEmailLogin(email, url) {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    const userCredential = await signInWithEmailLink(auth, email, url);
    return userCredential.user;
  }
};
