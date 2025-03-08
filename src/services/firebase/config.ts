import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCGP2eOMIaxbMg2sAD9ZxvbLUN-s574riY",
  authDomain: "video-app-cc103.firebaseapp.com",
  projectId: "video-app-cc103",
  storageBucket: "video-app-cc103.firebasestorage.app",
  messagingSenderId: "303941886408",
  appId: "1:303941886408:web:85105d7ee277dd76f360fd",
  measurementId: "G-6RNGN286WL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;