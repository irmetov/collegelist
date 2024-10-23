import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD2xF1FuXp6KzbB_gOixH-N3xI-Dp5kjBs",
    authDomain: "college-app-tracker-6d1c3.firebaseapp.com",
    projectId: "college-app-tracker-6d1c3",
    storageBucket: "college-app-tracker-6d1c3.appspot.com",
    messagingSenderId: "86893089398",
    appId: "1:86893089398:web:1120367828d49e02180557"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);