// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace with the actual config from your Firebase project!
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWPUPKeO8q5l4lFmv7LOxyBrz9wBNC570",
  authDomain: "kurazhelp-docs.firebaseapp.com",
  projectId: "kurazhelp-docs",
  storageBucket: "kurazhelp-docs.firebasestorage.app",
  messagingSenderId: "780920739937",
  appId: "1:780920739937:web:5e5afd1aaaafddb4bd7220",
  measurementId: "G-GDK5G4W1ZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { auth, db };