'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Listing } from '@/types/listing'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Bookmark, MessageSquare, X, 
  Phone, MapPin, User, Share2, 
  ChevronLeft, ChevronRight 
} from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { getCategoryColor } from "@/lib/categories"
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/layout/AuthLayout'

interface MarketplacePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  listing: Listing
}

export default function MarketplacePreviewModal({ isOpen, onClose, listing }: MarketplacePreviewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const router = useRouter()
  const { user } = useAuthContext()

  const nextImage = () => {
    setIsLoading(true)
    setCurrentImageIndex(prev => 
      prev === (listing.images?.length || 1) - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setIsLoading(true)
    setCurrentImageIndex(prev => 
      prev === 0 ? (listing.images?.length || 1) - 1 : prev - 1
    )
  }

  const categoryColor = getCategoryColor(listing.category || 'Others')

  const handleMessageClick = async () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!listing.id || !listing.userId) {
      console.error('Missing listing ID or seller ID');
      return;
    }

    try {
      // Navigate to messages page with the listing ID and seller ID
      router.push(`/messages?listingId=${listing.id}&sellerId=${listing.userId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (!isOpen || !listing) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-3xl bg-[var(--background)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Title */}
            <div className="p-4 border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[var(--foreground)]">{listing.title}</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-[var(--accent)] transition-colors"
                  aria-label="Close modal"
                >
                  <Icon icon={X} size={20} color="var(--foreground)" />
                </button>
              </div>
            </div>

            {/* Images Section */}
            <div className="w-full bg-gradient-to-br from-[var(--accent)] to-[var(--background)] flex flex-col items-center justify-center p-4 relative">
              {/* Main Image */}
              <div className="w-full h-64 md:h-80 flex items-center justify-center relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-[var(--accent)] animate-pulse rounded-lg"></div>
                )}
                <motion.img
                  key={currentImageIndex}
                  src={listing.images?.[currentImageIndex] || '/placeholder.png'}
                  alt={listing.title}
                  className="w-full h-full object-contain rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoading ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                  onLoad={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                />

                {/* Navigation Arrows */}
                {listing.images && listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-[var(--background)]/80 backdrop-blur-sm shadow-md hover:bg-[var(--background)] transition-colors"
                      aria-label="Previous image"
                    >
                      <Icon icon={ChevronLeft} size={20} color="var(--foreground)" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-[var(--background)]/80 backdrop-blur-sm shadow-md hover:bg-[var(--background)] transition-colors"
                      aria-label="Next image"
                    >
                      <Icon icon={ChevronRight} size={20} color="var(--foreground)" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto w-full py-2 px-1">
                  {listing.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setIsLoading(true)
                        setCurrentImageIndex(i)
                      }}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === i 
                          ? 'border-[var(--primary)] shadow-md' 
                          : 'border-transparent hover:border-[var(--border)]'
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Title and Price */}
              <div className="mb-4">
                <h1 className="text-xl font-bold text-[var(--foreground)]">{listing.title}</h1>
                <div className="text-2xl font-bold text-[var(--primary)] mt-1">
                  MWK {listing.price.toLocaleString()}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {listing.category && (
                  <span className={`px-3 py-1 ${categoryColor.bg} ${categoryColor.text} text-sm font-medium rounded-full`}>
                    {listing.category}
                  </span>
                )}
                {listing.condition && (
                  <span className="px-3 py-1 bg-[var(--success)]/10 text-[var(--success)] text-sm font-medium rounded-full">
                    {listing.condition}
                  </span>
                )}
                {listing.university && (
                  <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium rounded-full">
                    {listing.university}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">Description</h3>
                <div className="text-[var(--foreground)]/70 whitespace-pre-line">
                  {listing.description || "No description provided."}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {listing.stock !== undefined && (
                  <div>
                    <p className="text-sm text-[var(--foreground)]/50">Available Stock</p>
                    <p className="font-medium text-[var(--foreground)]">{listing.stock}</p>
                  </div>
                )}
                {listing.isWholesale !== undefined && (
                  <div>
                    <p className="text-sm text-[var(--foreground)]/50">Wholesale</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {listing.isWholesale ? 'Yes' : 'No'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-[var(--foreground)]/50">Listed</p>
                  <p className="font-medium text-[var(--foreground)]">2 days ago</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground)]/50">Views</p>
                  <p className="font-medium text-[var(--foreground)]">124</p>
                </div>
              </div>

              {/* Seller Info */}
              <div className="mt-6 p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--border)]">
                <h3 className="font-semibold text-[var(--foreground)] mb-3">Posted by</h3>
                <div className="flex items-center gap-3 mb-3">
                  {listing.sellerPhotoURL ? (
                    <img 
                      src={listing.sellerPhotoURL} 
                      alt="Seller" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-[var(--background)] shadow-sm" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center">
                      <Icon icon={User} size={20} color="var(--foreground)/50" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-[var(--foreground)]">
                      {listing.sellerName || 'Seller'}
                    </div>
                    {listing.sellerUsername && (
                      <div className="text-xs text-[var(--foreground)]/50">
                        @{listing.sellerUsername}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {listing.sellerBio && (
                    <div className="col-span-2">
                      <p className="text-[var(--foreground)]/50">Bio</p>
                      <p className="font-medium text-[var(--foreground)]">{listing.sellerBio}</p>
                    </div>
                  )}
                  {listing.sellerLocation && (
                    <div className="col-span-2">
                      <p className="text-[var(--foreground)]/50">Location</p>
                      <p className="font-medium flex items-center gap-1 text-[var(--foreground)]">
                        <Icon icon={MapPin} size={16} color="var(--foreground)" /> {listing.sellerLocation}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={handleMessageClick}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm hover:bg-[var(--primary)]/90 transition-colors"
                  >
                    <Icon icon={MessageSquare} size={20} color="white" /> Message
                  </button>
                  {listing.sellerPhone && (
                    <a 
                      href={`tel:${listing.sellerPhone}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-[var(--accent)] rounded-lg text-sm hover:bg-[var(--accent)]/80 transition-colors text-[var(--foreground)]"
                    >
                      <Icon icon={Phone} size={20} color="var(--foreground)" /> Call
                    </a>
                  )}
                  {listing.sellerWhatsapp && (
                    <a 
                      href={`https://wa.me/${listing.sellerWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-[var(--success)]/10 text-[var(--success)] rounded-lg text-sm hover:bg-[var(--success)]/20 transition-colors"
                    >
                      <Icon icon={MessageSquare} size={20} color="var(--foreground)" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-[var(--background)] border-t border-[var(--border)] p-3 flex gap-2">
              <button 
                onClick={handleMessageClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-colors font-medium"
              >
                <Icon icon={MessageSquare} size={20} color="white" /> Contact Seller
              </button>
              <button 
                className="p-2 rounded-lg bg-[var(--accent)] text-[var(--foreground)] hover:bg-[var(--accent)]/80 transition-colors"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Icon 
                  icon={Heart} 
                  size={24} 
                  color={isLiked ? 'var(--primary)' : 'var(--foreground)/60'} 
                  className="hover:scale-110 transition-transform" 
                />
              </button>
              <button className="p-2 rounded-lg bg-[var(--accent)] text-[var(--foreground)] hover:bg-[var(--accent)]/80 transition-colors">
                <Icon 
                  icon={Bookmark} 
                  size={24} 
                  color={'var(--foreground)/60'} 
                  className="hover:scale-110 transition-transform" 
                />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}