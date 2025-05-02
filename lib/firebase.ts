// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAucKczIi3IvstCjGsy4FpLjbf-PPuE0v4",
  authDomain: "social-app-dbfc7.firebaseapp.com",
  projectId: "social-app-dbfc7",
  storageBucket: "social-app-dbfc7.appspot.com", // corrected!
  messagingSenderId: "1004425254160",
  appId: "1:1004425254160:web:01383bd3f8beaaa9360195",
  measurementId: "G-F7HB5JM1CC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
