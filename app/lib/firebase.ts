// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"; // Veritabanı için

// BURADAKİ BİLGİLERİ KENDİ FIREBASE PANELİNDEN KOPYALA
const firebaseConfig = {
  apiKey: "AIzaSyDi5GAW2UKEGHJg6yha8Hmh2FKpTWEvw0U",
  authDomain: "raf-app-8c8d2.firebaseapp.com",
  projectId: "raf-app-8c8d2",
  storageBucket: "raf-app-8c8d2.firebasestorage.app",
  messagingSenderId: "576449142058",
  appId: "1:576449142058:web:308dd930d1f398ae421253"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);