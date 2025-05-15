"use client";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase";
import {Button} from "@/components/ui/Button";
import { Package, Wrench, ArrowLeft } from "lucide-react";

export default function CreateListingPage() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"goods" | "service" | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "New",
    stock: "",
    isWholesale: false,
    // Service specific fields
    serviceType: "",
    availability: "",
    location: "",
    duration: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImages(files);
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to create a listing.");

      // Fetch seller's public profile
      const publicProfileRef = doc(db, "users_public", user.uid);
      const publicProfileSnap = await getDoc(publicProfileRef);
      const publicProfile = publicProfileSnap.exists() ? publicProfileSnap.data() : {};

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) throw new Error("Please enter a valid price.");

      // Only validate stock for goods
      if (listingType === "goods") {
        const stock = parseInt(formData.stock);
        if (isNaN(stock) || stock <= 0) throw new Error("Please enter a valid stock number.");
      }

      const imageUrls = images.length
        ? await Promise.all(images.map(async (image) => {
            const storageRef = ref(storage, `listings/${uuidv4()}-${image.name}`);
            await uploadBytes(storageRef, image);
            return await getDownloadURL(storageRef);
          }))
        : [];

      await addDoc(collection(db, "listings"), {
        ...formData,
        price,
        stock: listingType === "goods" ? parseInt(formData.stock) : null,
        isWholesale: listingType === "goods" ? formData.isWholesale : false,
        images: imageUrls,
        createdAt: new Date(),
        userId: user.uid,
        // Add seller's public profile information
        sellerName: publicProfile.displayName || user.displayName || 'Unknown seller',
        sellerUsername: publicProfile.username || '',
        sellerBio: publicProfile.bio || '',
        sellerPhotoURL: publicProfile.photoURL || user.photoURL || '',
        sellerPhone: publicProfile.showPhone ? publicProfile.phone : null,
        sellerWhatsapp: publicProfile.showWhatsapp ? publicProfile.whatsapp : null,
        sellerLocation: publicProfile.location || '',
        university: publicProfile.university || "Mzuzu University",
        status: "active",
        listingType,
      });

      // Add a small delay before redirecting to ensure the listing is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push("/listings?created=true");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!listingType) {
    return (
      <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto bg-[var(--background)] rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Create New Listing</h1>
            <p className="mt-2 text-[var(--foreground)]/70">Select the type of listing you want to create</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setListingType("goods")}
              className="p-6 border-2 border-[var(--border)] rounded-xl hover:border-[var(--primary)] transition-colors group"
            >
              <Package className="w-12 h-12 mx-auto mb-4 text-[var(--primary)] group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold mb-2">Goods</h2>
              <p className="text-sm text-[var(--foreground)]/70">
                Sell physical items like books, electronics, clothing, etc.
              </p>
            </button>

            <button
              onClick={() => setListingType("service")}
              className="p-6 border-2 border-[var(--border)] rounded-xl hover:border-[var(--primary)] transition-colors group"
            >
              <Wrench className="w-12 h-12 mx-auto mb-4 text-[var(--primary)] group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold mb-2">Service</h2>
              <p className="text-sm text-[var(--foreground)]/70">
                Offer services like tutoring, repairs, event planning, etc.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto bg-[var(--background)] rounded-xl shadow-md overflow-hidden p-8">
        <button
          onClick={() => setListingType(null)}
          className="flex items-center text-[var(--primary)] hover:text-[var(--primary-hover)] mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to selection</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Create New {listingType === "goods" ? "Product" : "Service"} Listing</h1>
          <p className="mt-2 text-[var(--foreground)]/70">Fill in the details of your {listingType === "goods" ? "item" : "service"}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--error)]/10 text-[var(--error)] rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                Title*
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)] uppercase"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                Description*
              </label>
              <textarea
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg min-h-[120px] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                  Price (MWK)*
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                  Category*
                </label>
                <select
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {listingType === "goods" ? (
                    <>
                      <option value="Electronics">Electronics</option>
                      <option value="books">Books</option>
                      <option value="clothing">Clothing & Fashion</option>
                      <option value="food">Food</option>
                      <option value="furniture">Furniture</option>
                      <option value="stationery">Stationery</option>
                      <option value="sports">Sports & Fitness</option>
                      <option value="beauty">Beauty & Personal Care</option>
                      <option value="others">Others</option>
                    </>
                  ) : (
                    <>
                      <option value="tutoring">Tutoring</option>
                      <option value="repairs">Repairs & Maintenance</option>
                      <option value="events">Event Planning</option>
                      <option value="transport">Transportation</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="beauty">Beauty & Wellness</option>
                      <option value="tech">Tech Support</option>
                      <option value="others">Others</option>
                    </>
                  )}
                </select>
              </div>

              {listingType === "goods" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                      Condition*
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      required
                    >
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                      Number of Stock*
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      min="1"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isWholesale"
                      checked={formData.isWholesale}
                      onChange={(e) => setFormData({ ...formData, isWholesale: e.target.checked })}
                      className="h-4 w-4 text-[var(--primary)] border-[var(--border)] rounded"
                    />
                    <label htmlFor="isWholesale" className="text-sm text-[var(--primary)]">
                      Is this a wholesale listing?
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                      Service Type*
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      required
                    >
                      <option value="">Select service type</option>
                      <option value="one-time">One-time Service</option>
                      <option value="recurring">Recurring Service</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                      Availability*
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      required
                    >
                      <option value="">Select availability</option>
                      <option value="immediate">Immediate</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="on-demand">On Demand</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                      Location*
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      placeholder="e.g., Mzuzu University Campus"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                      Duration*
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                      placeholder="e.g., 2 hours, 1 day"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--primary)] mb-1">
                Images (Max 5)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--border)] border-dashed rounded-lg bg-[var(--background)]">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-[var(--foreground)] justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-[var(--background)] rounded-md font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] focus-within:outline-none"
                    >
                      <span>Upload images</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-[var(--foreground)]/60">PNG, JPG up to 5MB</p>
                </div>
              </div>

              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-16 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImages(prev => prev.filter((_, i) => i !== index));
                          setImagePreviews(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute top-0.5 right-0.5 bg-[var(--error)] text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-base font-medium rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            >
              {isSubmitting ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
