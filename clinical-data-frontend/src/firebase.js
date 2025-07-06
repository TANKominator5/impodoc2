import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🚨 PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSyCrLo380Vy3fy0OXF3Os9maKpzR7BxT5s8",
  authDomain: "impodoc-c12db.firebaseapp.com",
  projectId: "impodoc-c12db",
  storageBucket: "impodoc-c12db.firebasestorage.app",
  messagingSenderId: "866475571341",
  appId: "1:866475571341:web:c6510d03ae5cd7d11a8ac4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);