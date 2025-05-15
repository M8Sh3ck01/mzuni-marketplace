"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, Query, DocumentData, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaHeart, FaSave } from "react-icons/fa";
import MarketplacePreviewModal from "@/components/features/MarketplacePreviewModal";
import { Listing } from "@/types/listing";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { getCategoryColor } from "@/lib/categories";

interface ListingsPageProps {
  searchQuery?: string;
  category?: string;
}

export default function ListingsPage({ searchQuery, category }: ListingsPageProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // First get all listings ordered by createdAt
        let q: Query<DocumentData> = query(
          collection(db, "listings"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const listingsData: Listing[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Apply category filter client-side if it exists
          if (category && data.category !== category) {
            return; // Skip this listing if category doesn't match
          }
          
          // Apply search filter if it exists
          if (searchQuery && searchQuery.trim()) {
            const searchLower = searchQuery.toLowerCase().trim();
            const title = data.title?.toLowerCase() || '';
            const description = data.description?.toLowerCase() || '';
            const category = data.category?.toLowerCase() || '';
            
            if (!title.includes(searchLower) && 
                !description.includes(searchLower) && 
                !category.includes(searchLower)) {
              return; // Skip this listing if it doesn't match the search
            }
          }

          listingsData.push({
            id: doc.id,
            title: data.title,
            price: data.price,
            description: data.description,
            images: data.images || [],
            sellerId: data.sellerId,
            createdAt: data.createdAt?.toDate() || new Date(),
            category: data.category,
            condition: data.condition,
            sellerName: data.sellerName || 'Unknown Seller',
            sellerPhotoURL: data.sellerPhotoURL || null,
            sellerUsername: data.sellerUsername || null,
            sellerBio: data.sellerBio || null,
            sellerLocation: data.sellerLocation || null,
            sellerPhone: data.sellerPhone || null,
            sellerWhatsapp: data.sellerWhatsapp || null,
            university: data.university,
            stock: data.stock,
            isWholesale: data.isWholesale,
            contactName: data.contactName,
            contactPhone: data.contactPhone,
            contactEmail: data.contactEmail,
            userId: data.userId
          });
        });
        
        setListings(listingsData);
      } catch (error: any) {
        console.error("Error fetching listings:", error);
        if (error.code === 'permission-denied') {
          setError("You don't have permission to view listings. Please make sure you're logged in.");
        } else {
          setError("Failed to load listings. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [searchQuery, category]);

  const openModal = (listing: Listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[var(--accent)]/30 rounded-xl p-4 animate-pulse">
            <div className="aspect-square bg-[var(--accent)]/50 rounded-lg mb-4"></div>
            <div className="h-4 bg-[var(--accent)]/50 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-[var(--accent)]/50 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--error)] mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {listings.map((listing, index) => {
        const categoryColor = getCategoryColor(listing.category || 'Others');
        
        return (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border ${categoryColor.border}`}
          >
            <div
              onClick={() => openModal(listing)}
              className="cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={listing.images?.[0] || "/placeholder.png"}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {listing.category && (
                  <span className={`absolute top-2 left-2 px-3 py-1 ${categoryColor.bg} ${categoryColor.text} text-xs font-medium rounded-full`}>
                    {listing.category}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[var(--foreground)] line-clamp-2 mb-1">
                  {listing.title}
                </h3>
                <p className="text-lg font-bold text-[var(--primary)] mb-2">
                  MWK {listing.price.toLocaleString()}
                </p>
                <div className="flex items-center justify-between text-sm text-[var(--foreground)]/60">
                  <span>{listing.contactName || 'Unknown Seller'}</span>
                  <span>{formatDistanceToNow(listing.createdAt, { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4 flex justify-between">
              <button className={`p-2 ${categoryColor.hover} rounded-lg transition-colors`}>
                <FaHeart className={`${categoryColor.icon} hover:opacity-80`} />
              </button>
              <button className={`p-2 ${categoryColor.hover} rounded-lg transition-colors`}>
                <FaSave className={`${categoryColor.icon} hover:opacity-80`} />
              </button>
            </div>
          </motion.div>
        );
      })}

      {selectedListing && (
        <MarketplacePreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          listing={selectedListing}
        />
      )}
    </motion.div>
  );
}
