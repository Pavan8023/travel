// firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBsAJD586JHbv4kcKhXjhgrVO33dgKPFeg",
    authDomain: "expense-7542b.firebaseapp.com",
    projectId: "expense-7542b",
    storageBucket: "expense-7542b.appspot.com",
    messagingSenderId: "204918129088",
    appId: "1:204918129088:web:df7365068a9950a33b4825",
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
