export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  cuisine: string[];
  priceLevel: string;
  rating?: number;
  reviewCount?: number;
  imageUrl: string;
  coverImageUrl?: string;
  isOpen?: boolean;
  ownerId: string;
  managerId?: string;
  menu?: MenuItem[];
  reviews?: Review[];
  openingHours?: Record<string, { open: string; close: string }>;
  contactPhone?: string;
  contactEmail?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  categories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable?: boolean;
  preparationTime?: number;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  isFeatured?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  images?: string[];
  likes?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  serviceType: ServiceType;
  deliveryAddress?: string;
  deliveryFee?: number;
  tableNumber?: string;
  pickupTime?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus = 
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "in-delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export type ServiceType = "delivery" | "pickup" | "dine-in";

export interface RestaurantFilter {
  cuisine?: string[];
  priceLevel?: string[];
  rating?: number;
  isOpen?: boolean;
  distance?: number;
  searchQuery?: string;
}
