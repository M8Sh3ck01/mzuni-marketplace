"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import PageLoader from "@/components/ui/PageLoader";
import { motion } from "framer-motion";
import { use } from "react";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "New",
    stock: "",
    isWholesale: false,
    serviceType: "",
    availability: "",
    location: "",
    duration: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [listingType, setListingType] = useState<"goods" | "service" | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, "listings", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          router.push("/profile");
          return;
        }

        const data = docSnap.data();
        setListingType(data.listingType);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          category: data.category || "",
          condition: data.condition || "New",
          stock: data.stock?.toString() || "",
          isWholesale: data.isWholesale || false,
          serviceType: data.serviceType || "",
          availability: data.availability || "",
          location: data.location || "",
          duration: data.duration || "",
        });
        setExistingImages(data.images || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching listing:", error);
        setError("Failed to load listing");
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImages(files);
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
  };

  const handleRemoveExistingImage = async (imageUrl: string) => {
    try {
      // Remove from storage
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      
      // Update state
      setExistingImages(prev => prev.filter(url => url !== imageUrl));
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) throw new Error("Please enter a valid price.");

      if (listingType === "goods") {
        const stock = parseInt(formData.stock);
        if (isNaN(stock) || stock <= 0) throw new Error("Please enter a valid stock number.");
      }

      // Upload new images
      const newImageUrls = await Promise.all(
        images.map(async (image) => {
          const storageRef = ref(storage, `listings/${uuidv4()}-${image.name}`);
          await uploadBytes(storageRef, image);
          return await getDownloadURL(storageRef);
        })
      );

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      // Update the listing
      await updateDoc(doc(db, "listings", id), {
        ...formData,
        price,
        stock: listingType === "goods" ? parseInt(formData.stock) : null,
        isWholesale: listingType === "goods" ? formData.isWholesale : false,
        images: allImages,
        updatedAt: new Date(),
      });

      router.push("/profile");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading listing..." />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)] ml-4">Edit Listing</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--error)]/10 text-[var(--error)] rounded-lg text-center">
            {error}
          </div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6 bg-white rounded-xl shadow-md overflow-hidden p-8"
        >
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
                    <option value="Books">Books</option>
                    <option value="Clothing & Fashion">Clothing & Fashion</option>
                    <option value="Food">Food</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Others">Others</option>
                  </>
                ) : (
                  <>
                    <option value="Tutoring">Tutoring</option>
                    <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                    <option value="Event Planning">Event Planning</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Beauty & Wellness">Beauty & Wellness</option>
                    <option value="Tech Support">Tech Support</option>
                    <option value="Others">Others</option>
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

                <div className="flex items-center gap-2">
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
            <div className="space-y-4">
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-16 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(imageUrl)}
                        className="absolute top-0.5 right-0.5 bg-[var(--error)] text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New Images Upload */}
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-[var(--foreground)] justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-[var(--background)] rounded-md font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] focus-within:outline-none"
                  >
                    <span>Upload new images</span>
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

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
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

          <div className="flex justify-end gap-4 pt-4">
            <Link href="/profile">
              <Button
                type="button"
                variant="outline"
                className="px-6 py-3"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
} 