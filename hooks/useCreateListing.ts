import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { Listing } from '@/types/listing';

export function useCreateListing() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createListing = async (listingData: Omit<Listing, 'id' | 'sellerId' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('You must be logged in to create a listing');
      }
      
      // Add the listing to Firestore with the current user's ID as the sellerId
      const listingRef = await addDoc(collection(db, 'listings'), {
        ...listingData,
        sellerId: user.uid, // This ensures each listing has the correct sellerId
        userId: user.uid, // For UI compatibility
        contactName: user.displayName || user.email || 'Unknown seller',
        createdAt: serverTimestamp(),
      });
      
      setIsLoading(false);
      return { id: listingRef.id, success: true };
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
      setIsLoading(false);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create listing' };
    }
  };
  
  return { createListing, isLoading, error };
}
