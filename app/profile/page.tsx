"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Pencil, Edit, Trash2, Archive, MoreVertical, Eye, User } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/ui/PageLoader";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { getCategoryColor } from "@/lib/categories";
import MarketplacePreviewModal from "@/components/features/MarketplacePreviewModal";

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const router = useRouter();
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "Not set";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      console.log('Fetching profile for user:', user.uid);
      const publicRef = doc(db, "users_public", user.uid);
      const privateRef = doc(db, "users_private", user.uid);
      const [publicSnap, privateSnap] = await Promise.all([
        getDoc(publicRef),
        getDoc(privateRef)
      ]);
      if (publicSnap.exists() || privateSnap.exists()) {
        const profileData = {
          ...(privateSnap.exists() ? privateSnap.data() : {}),
          ...(publicSnap.exists() ? publicSnap.data() : {}),
        };
        console.log('Fetched profile data:', profileData);
        console.log('Photo URL from profile:', profileData.photoURL);
        console.log('Photo URL from user:', user.photoURL);
        setProfile(profileData);
      } else {
        router.push('/profile/setup');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, router]);

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, "listings"),
          where("userId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const listingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        setListings(listingsData);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, [user]);

  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    
    try {
      await deleteDoc(doc(db, "listings", listingId));
      setListings(listings.filter(listing => listing.id !== listingId));
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  const handleArchive = async (listingId: string) => {
    try {
      await updateDoc(doc(db, "listings", listingId), {
        status: "archived"
      });
      setListings(listings.map(listing => 
        listing.id === listingId 
          ? { ...listing, status: "archived" }
          : listing
      ));
    } catch (error) {
      console.error("Error archiving listing:", error);
    }
  };

  // Calculate stats
  const activeListings = listings.filter(listing => listing.status === 'active').length;
  const archivedListings = listings.filter(listing => listing.status === 'archived').length;
  const totalListings = listings.length;

  if (loading) {
    return <PageLoader text="Loading your profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">My Profile</h1>
        <Link href="/profile/setup">
          <Button className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Image and Basic Info */}
        <div className="md:col-span-1">
          <div className="bg-[var(--background)] shadow-md rounded-lg p-6 space-y-6 border border-[var(--border)]">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                {profile?.photoURL || user?.photoURL ? (
                  <Avatar
                    src={profile?.photoURL || user?.photoURL}
                    alt={profile?.firstName || "Profile Picture"}
                    size={160}
                    className="border-4 border-[var(--primary)] transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-[var(--accent)] flex items-center justify-center border-4 border-[var(--primary)]">
                    <User className="w-20 h-20 text-[var(--foreground-muted)]" />
                  </div>
                )}
                <Link href="/profile/setup" className="absolute bottom-0 right-0 bg-[var(--primary)] text-white p-2 rounded-full hover:bg-[var(--primary-hover)] transition-colors opacity-0 group-hover:opacity-100">
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                  {capitalizeFirstLetter(profile?.firstName)} {capitalizeFirstLetter(profile?.surname)}
                </h2>
                <p className="text-[var(--foreground)]/70">@{profile?.username}</p>
                {profile?.studentId && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Verified Student
                  </div>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--primary)]">{totalListings}</p>
                <p className="text-sm text-[var(--foreground)]/70">Listings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--primary)]">{activeListings}</p>
                <p className="text-sm text-[var(--foreground)]/70">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--primary)]">{archivedListings}</p>
                <p className="text-sm text-[var(--foreground)]/70">Archived</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-[var(--background)] shadow-md rounded-lg p-6 border border-[var(--border)]">
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--foreground)]/70">First Name</p>
                <p className="text-[var(--foreground)] font-medium">{capitalizeFirstLetter(profile?.firstName)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)]/70">Surname</p>
                <p className="text-[var(--foreground)] font-medium">{capitalizeFirstLetter(profile?.surname)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)]/70">Username</p>
                <p className="text-[var(--foreground)] font-medium">@{profile?.username}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)]/70">Email</p>
                <p className="text-[var(--foreground)] font-medium">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-[var(--background)] shadow-md rounded-lg p-6 border border-[var(--border)]">
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--foreground)]/70">Student ID</p>
                <p className="text-[var(--foreground)] font-medium">{profile?.studentId || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)]/70">Program</p>
                <p className="text-[var(--foreground)] font-medium">{profile?.program || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)]/70">Year of Study</p>
                <p className="text-[var(--foreground)] font-medium">{profile?.yearOfStudy || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)]/70">University</p>
                <p className="text-[var(--foreground)] font-medium">{profile?.university || "Not set"}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-[var(--background)] shadow-md rounded-lg p-6 border border-[var(--border)]">
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--foreground)]/70">Phone Number</p>
                <p className="text-[var(--foreground)] font-medium">{profile?.phone || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)]/70">WhatsApp Number</p>
                <p className="text-[var(--foreground)] font-medium">{profile?.whatsapp || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)]/70">Location</p>
                <p className="text-[var(--foreground)] font-medium">{profile?.location || "Not set"}</p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile?.bio && (
            <div className="bg-[var(--background)] shadow-md rounded-lg p-6 border border-[var(--border)]">
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">About</h3>
              <p className="text-[var(--foreground)]">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* My Listings Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">My Listings</h2>
          <Link href="/post">
            <Button className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
              <Pencil className="w-4 h-4" />
              Create New Listing
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const categoryColor = getCategoryColor(listing.category || 'Others');
            
            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border ${categoryColor.border}`}
              >
                <div className="relative">
                  <img
                    src={listing.images?.[0] || "/placeholder.png"}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-3 py-1 ${categoryColor.bg} ${categoryColor.text} text-xs font-medium rounded-full`}>
                      {listing.category}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => setShowMenuId(showMenuId === listing.id ? null : listing.id)}
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    <AnimatePresence>
                      {showMenuId === listing.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg py-1 z-10"
                        >
                          <button
                            onClick={() => {
                              setSelectedListing(listing);
                              setIsModalOpen(true);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-[var(--accent)] flex items-center gap-2"
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            onClick={() => router.push(`/edit-listing/${listing.id}`)}
                            className="w-full px-4 py-2 text-left hover:bg-[var(--accent)] flex items-center gap-2"
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchive(listing.id)}
                            className="w-full px-4 py-2 text-left hover:bg-[var(--accent)] flex items-center gap-2"
                          >
                            <Archive size={16} />
                            Archive
                          </button>
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="w-full px-4 py-2 text-left text-[var(--error)] hover:bg-[var(--error)]/10 flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-[var(--foreground)] line-clamp-2 mb-1">
                    {listing.title}
                  </h3>
                  <p className="text-lg font-bold text-[var(--primary)] mb-2">
                    MWK {listing.price.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between text-sm text-[var(--foreground)]/60">
                    <span>{formatDistanceToNow(listing.createdAt, { addSuffix: true })}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      listing.status === 'active' 
                        ? 'bg-[var(--success)]/10 text-[var(--success)]'
                        : 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-12 bg-[var(--background)] rounded-lg border border-[var(--border)]">
            <p className="text-[var(--foreground)]/60 mb-4">You haven't created any listings yet.</p>
            <Link href="/post">
              <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
                Create Your First Listing
              </Button>
            </Link>
          </div>
        )}
      </div>

      {selectedListing && (
        <MarketplacePreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          listing={selectedListing}
        />
      )}
    </div>
  );
}
