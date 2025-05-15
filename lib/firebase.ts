// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

// Cloudinary
import { uploadImage as uploadToCloudinary } from "@/lib/cloudinary"; // or correct path

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

    let fileToUpload = file;
    
    // If file is larger than 5MB, compress it
    if (file.size > 5 * 1024 * 1024) {
      fileToUpload = await compressImage(file);
    }

    // Create a storage reference
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, fileToUpload);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Add this helper function for image compression
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = 1200; // Max width or height
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with reduced quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.7 // Quality: 0.7 = 70%
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export { auth, db, storage, analytics };



