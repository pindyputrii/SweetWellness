import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3L0hGY47c9FPYYvAFJ0mp-lh9V66jH4Y",
  authDomain: "sweetwellness-e65dd.firebaseapp.com",
  projectId: "sweetwellness-e65dd",
  storageBucket: "sweetwellness-e65dd.firebasestorage.app",
  messagingSenderId: "854074207890",
  appId: "1:854074207890:web:ffc816875d66b2af4f804b",
  measurementId: "G-FV98W9HBBH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });