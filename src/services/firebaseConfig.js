import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDcRYiCrrpyzUFIESePGTD2b1SKzl2MPE",
  authDomain: "greenstack-13c6a.firebaseapp.com",
  projectId: "greenstack-13c6a",
  storageBucket: "greenstack-13c6a.firebasestorage.app",
  messagingSenderId: "701791787547",
  appId: "1:701791787547:web:9d1cc2ccb0bb364bf9f6be",
  measurementId: "G-3FW33NL6DX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);