"use client";
import { useAuth } from "@/hooks/useAuth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { ListingsTable } from "@/components/dashboard/Listings-table";

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
}

export default function ListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        if (!user?.uid) return;
        
        const q = query(
          collection(db, "listings"),
          where("userId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const listingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Listing[];
        
        setListings(listingsData);
      } catch (err) {
        setError("Failed to fetch listings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user?.uid]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Listings</h1>
      {listings.length > 0 ? (
        <ListingsTable data={listings} />
      ) : (
        <p>No listings found</p>
      )}
    </div>
  );
}