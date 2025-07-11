export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers?: number;
  following?: number;
  recipes?: number;
  reviews?: number;
  role?: UserRole;
  verified?: boolean;
  isProfileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  preferences?: UserPreferences;
  restaurantId?: string;
  restaurantName?: string;
  address?: string;
}

export type UserRole = 'user' | 'owner' | 'manager' | 'admin';

export interface UserPreferences {
  darkMode?: boolean;
  notifications?: {
    orders?: boolean;
    promotions?: boolean;
    messages?: boolean;
  };
  dietaryRestrictions?: string[];
  favoriteCategories?: string[];
}

export interface CountryCode {
  name: string;
  code: string;
  flag: string;
  format?: string;
  minLength?: number;
  maxLength?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  phoneNumber: string | null;
  userRole: UserRole;
  generatedOtp: string | null;
  
  // Auth actions
  login: (phone: string, role?: UserRole) => Promise<string | undefined>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<string | undefined>;
  verifyOtp: (otp: string) => Promise<boolean>;
  resendOtp: () => Promise<string | undefined>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  
  // Social actions
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
}
