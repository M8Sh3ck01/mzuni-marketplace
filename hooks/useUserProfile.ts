import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/lib/firebase';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  createdAt: Date;
  university?: string;
  totalListings: number;
  rating?: number;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch the current user's profile
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // User profile exists, get the data
          const userData = userDoc.data();
          setProfile({
            id: user.uid,
            displayName: userData.displayName || user.displayName || 'User',
            email: userData.email || user.email || '',
            phone: userData.phone || '',
            photoURL: userData.photoURL || user.photoURL || '',
            createdAt: userData.createdAt ? new Date(userData.createdAt.toDate()) : new Date(),
            university: userData.university || '',
            totalListings: userData.totalListings || 0,
            rating: userData.rating || 0,
          });
        } else {
          // User profile doesn't exist, create it
          const newUserProfile = {
            displayName: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            createdAt: new Date(),
            totalListings: 0,
          };
          
          await setDoc(userDocRef, newUserProfile);
          
          setProfile({
            id: user.uid,
            ...newUserProfile,
            phone: '',
            university: '',
            rating: 0,
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        setIsLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Function to update the user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) {
      setError('No user profile to update');
      return { success: false, error: 'No user profile to update' };
    }
    
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', profile.id);
      await updateDoc(userDocRef, updates);
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setIsLoading(false);
      
      return { success: true };
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Failed to update user profile');
      setIsLoading(false);
      
      return { success: false, error: 'Failed to update user profile' };
    }
  };
  
  return { profile, isLoading, error, updateProfile };
}
