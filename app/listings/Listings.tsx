"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaHeart, FaSave } from "react-icons/fa";
import { PreviewModal } from "@/components";

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      const querySnapshot = await getDocs(collection(db, "listings"));
      const listingsData: any[] = [];
      querySnapshot.forEach((doc) => {
        listingsData.push({ id: doc.id, ...doc.data() });
      });
      setListings(listingsData);
    };

    fetchListings();
  }, []);

  const openModal = (listing: any) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <section>
        <h2 className="text-3xl font-bold mb-4">All Items Posted</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white p-4 rounded-lg shadow-lg">
              <div
                onClick={() => openModal(listing)}
                className="cursor-pointer"
              >
                <img
                  src={listing.images?.[0] || "/placeholder.png"}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold">{listing.title}</h3>
                <p className="text-gray-600 mb-2">MWK {listing.price}</p>
              </div>
              <div className="flex justify-between mt-4">
                <FaHeart className="text-red-500 hover:text-red-700 cursor-pointer" />
                <FaSave className="text-blue-500 hover:text-blue-700 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedListing && (
        <PreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          listing={selectedListing}
        />
      )}
    </div>
  );
}
