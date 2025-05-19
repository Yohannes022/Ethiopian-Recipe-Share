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
  deliveryFee?: number;
  estimatedDeliveryTime?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isVerified?: boolean;
  image: string;
  coverImage: string;
  website?: string;
  distance?: string;
  phone?: string;
  websiteUrl?: string;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  dineInAvailable?: boolean;
  deliveryTime?: string;
  pickupTime?: string;
  dineInTime?: string;
  deliveryInstructions?: string;
  pickupInstructions?: string;  
  dineInInstructions?: string;
  isSelected?: boolean; // For UI purposes
  isSaved?: boolean; // For UI purposes
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  type?: string; // e.g., "Home", "Work", etc.
  isSelected?: boolean; // For UI purposes
  isSaved?: boolean; // For UI purposes
  isVisible?: boolean; // For UI purposes
  expiryDate?: string; // For UI purposes
  expiryMonth?: any; // For UI purposes
  expiryYear?: any; // For UI purposes
  isExpired?: boolean; // For UI purposes
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
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
  tags?: string[];
  spicy?: boolean;
  popular?: boolean;
  cousine?: string;
  restaurant?: Restaurant;
  reviews?: Review[];
  isPopular?: boolean;
  isNew?: boolean;
  isRecommended?: boolean;
  openingHours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
}

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comments: string;
  response?: string;
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
  subtotal: number;
  tax: number;
  tip: number;
  // paymentMethod: string;
  paymentStatus: PaymentStatus;
  serviceType: OrderServiceType;
  // deliveryAddress?: string;
  driverInfo: {
  name: string;
  phone: string;
  photoUrl: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
} | null;
  deliveryFee?: number;
  tableNumber?: string;
  pickupTime?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: number;
  estimatedPickupTime?: number;
  orderNumber?: string;
  restaurant?: Restaurant;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  paymentDetails?: {
    transactionId: string;
    paymentDate: string;
    paymentMethod: string;
    amount: number;
    status: PaymentStatus;
  };
  orderHistory?: {
    status: OrderStatus;
    timestamp: string;
  }[];
  date?: string;
  time?: string;
  deliveryAddressDetails?: Address;
  deliveryInstructions?: string;
  orderType?: string; // e.g., "delivery", "pickup", "dine-in"
  orderStatus?: string; // e.g., "pending", "confirmed", "in-progress", "completed"
  orderItems?: {
    [key: string]: {
      id: string;
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      specialInstructions?: string;
    };
  };
  paymentMethod: {
  id: string;
  type: string;
  name: string;
  last4?: string;
}
deliveryAddress: string | {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  instructions?: string;
  location: {
    latitude: number;
    longitude: number;
  };
};
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

export type OrderServiceType = "delivery" | "pickup" | "dine-in";

export interface RestaurantFilter {
  cuisine?: string[];
  priceLevel?: string[];
  rating?: number;
  isOpen?: boolean;
  distance?: number;
  searchQuery?: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: "card" | "mobile-money";
  cardBrand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  provider?: string;
  phoneNumber?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}