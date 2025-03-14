// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8qK71j496lpvD0LAtEd7IgT8EFZcDPBs",
  authDomain: "port-gen.firebaseapp.com",
  projectId: "port-gen",
  storageBucket: "port-gen.firebasestorage.app",
  messagingSenderId: "927545431578",
  appId: "1:927545431578:web:976a5a9d261dc892d4a3a3",
  measurementId: "G-4EWCWFLDSM"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { db, auth, storage };
export default app;