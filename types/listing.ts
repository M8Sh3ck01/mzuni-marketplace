export interface Listing {
  university?: string; // For location/university display
  stock?: number; // Number of items in stock
  isWholesale?: boolean; // Whether wholesale is available
  contactName?: string; // Seller's name
  contactPhone?: string; // Seller's phone number
  contactEmail?: string; // Seller's email address
  id: string;
  title: string;
  price: number;
  description?: string;
  images: string[];
  sellerId: string;
  userId?: string; // Added for compatibility with UI and context
  createdAt: Date;
  category?: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
}

export interface ListingsFilter {
  searchQuery?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Listing['condition'];
}
