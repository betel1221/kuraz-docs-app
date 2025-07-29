// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBWPUPKeO8q5l4lFmv7LOxyBrz9wBNC570",
  authDomain: "kurazhelp-docs.firebaseapp.com",
  projectId: "kurazhelp-docs",
  storageBucket: "kurazhelp-docs.firebasestorage.app",
  messagingSenderId: "780920739937",
  appId: "1:780920739937:web:5e5afd1aaaafddb4bd7220",
  measurementId: "G-GDK5G4W1ZD"
};

const app = initializeApp(firebaseConfig);


const auth = getAuth(app);


const db = getFirestore(app);

export { auth, db };