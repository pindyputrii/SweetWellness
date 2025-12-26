// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Untuk Database
import { getAuth } from "firebase/auth";           // Untuk Login

const firebaseConfig = {
  apiKey: "AIzaSyA3L0hGY47c9FPYYvAFJ0mp-lh9V66jH4Y",
  authDomain: "sweetwellness-e65dd.firebaseapp.com",
  projectId: "sweetwellness-e65dd",
  storageBucket: "sweetwellness-e65dd.firebasestorage.app",
  messagingSenderId: "854074207890",
  appId: "1:854074207890:web:ffc816875d66b2af4f804b",
  measurementId: "G-FV98W9HBBH"
};


// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor instance untuk digunakan di komponen lain
export const db = getFirestore(app);
export const auth = getAuth(app);