import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGJ6Bkr0QS3CKPAKMjskdQf7gNZynyETY",
  authDomain: "expense-splitter-e5c0b.firebaseapp.com",
  projectId: "expense-splitter-e5c0b",
  storageBucket: "expense-splitter-e5c0b.firebasestorage.app",
  messagingSenderId: "929104612475",
  appId: "1:929104612475:web:34943230a305171fe4a6de"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);