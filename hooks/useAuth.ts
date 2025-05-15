import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { 
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('Attempting login with:', { email, rememberMe });
      
      if (rememberMe) {
        console.log('Setting persistence to local');
        await setPersistence(auth, browserLocalPersistence);
      }

      console.log('Calling signInWithEmailAndPassword');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Attempting Google login');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google login successful:', result.user.email);
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  return {
    user,
    loading,
    login,
    loginWithGoogle,
    resetPassword,
    logout: () => signOut(auth)
  };
}

function getAuthErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    console.log('Auth error code:', error.code);
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Login popup was closed before completing the sign in.';
      case 'auth/popup-blocked':
        return 'Popup was blocked by the browser. Please allow popups for this site.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials.';
      default:
        return `Login failed: ${error.code}. Please try again.`;
    }
  }
  return 'An unknown error occurred';
}