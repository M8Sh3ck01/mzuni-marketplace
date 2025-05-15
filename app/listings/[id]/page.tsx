import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import { 
  FiHeart, FiBookmark, FiShare2,
  FiArrowLeft,
  FiThumbsDown, 
   
} from 'react-icons/fi'
type Props = {
  params: { id: string };
};

export default async function ListingDetailPage({ params }: Props) {
  const docRef = doc(db, "listings", params.id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return notFound();

  const listing = snap.data();
  const {
    title,
    description,
    price,
    category,
    condition,
    images = [],
    isWholesale,
    stock,
    createdAt,
    university,
    sellerName,
    sellerUsername,
    sellerBio,
    sellerPhotoURL,
    sellerPhone,
    sellerWhatsapp,
    sellerLocation,
  } = listing;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back Arrow */}
      <div className="mb-6">
        <a href="/listings" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">
          <FiArrowLeft className="inline-block mr-2" />
          Back to Listings
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Images */}
        <div className="space-y-4">
          <img
            src={images?.[0] || "/placeholder.png"}
            alt={title}
            className="w-full h-64 object-cover rounded-lg shadow"
          />
          <div className="grid grid-cols-3 gap-2">
            {images.slice(1).map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt={`Image ${i}`}
                className="h-20 object-cover rounded-lg border"
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 mb-1">Category: {category}</p>
          <p className="text-gray-600 mb-1">Condition: {condition}</p>
          <p className="text-gray-600 mb-1">Stock: {stock}</p>
          <p className="text-gray-600 mb-1">Wholesale: {isWholesale ? "Yes" : "No"}</p>
          <p className="text-gray-600 mb-1">University: {university}</p>
          <p className="text-xl font-semibold text-[var(--primary)] mt-4">
            MWK {price.toLocaleString()}
          </p>

          {/* Seller Information */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Seller Information</h2>
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={sellerPhotoURL || "/avatar-placeholder.png"}
                alt={sellerName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{sellerName}</p>
                {sellerUsername && <p className="text-sm text-gray-600">@{sellerUsername}</p>}
              </div>
            </div>
            {sellerBio && <p className="text-sm text-gray-600 mb-3">{sellerBio}</p>}
            <div className="space-y-2">
              {sellerPhone && (
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {sellerPhone}
                </p>
              )}
              {sellerWhatsapp && (
                <p className="text-sm">
                  <span className="font-medium">WhatsApp:</span> {sellerWhatsapp}
                </p>
              )}
              {sellerLocation && (
                <p className="text-sm">
                  <span className="font-medium">Location:</span> {sellerLocation}
                </p>
              )}
            </div>
          </div>

          {/* Like, Save, Hate Icons */}
          <div className="flex mt-6 space-x-4">
            <button className="text-red-500 hover:text-red-600">
              <FiHeart size={24} />
            </button>
            <button className="text-yellow-500 hover:text-yellow-600">
              <FiBookmark size={24} />
            </button>
            <button className="text-blue-500 hover:text-blue-600">
              <FiThumbsDown size={24} />
            </button>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 text-gray-700 whitespace-pre-line">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
