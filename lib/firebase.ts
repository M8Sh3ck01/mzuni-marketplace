// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAucKczIi3IvstCjGsy4FpLjbf-PPuE0v4",
  authDomain: "social-app-dbfc7.firebaseapp.com",
  projectId: "social-app-dbfc7",
  storageBucket: "social-app-dbfc7.appspot.com",
  messagingSenderId: "1004425254160",
  appId: "1:1004425254160:web:01383bd3f8beaaa9360195",
  measurementId: "G-F7HB5JM1CC"
};

// Initialize Firebase
let app;
let analytics;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  // Initialize analytics only on the client side
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Helper function to handle image uploads
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Create a storage reference
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export { auth, db, storage, analytics };



