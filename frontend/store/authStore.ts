import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthState, User, UserRole } from "@/types/auth";
import { API_CONFIG } from "@/constants/api";
import api, { authAPI } from "@/lib/api";

// Helper function to generate a mock user
const createMockUser = (phone: string, role: UserRole = 'user'): User => ({
  id: `user-${Date.now()}`,
  name: `User ${Math.floor(Math.random() * 1000)}`,
  phone,
  role,
  verified: true,
  createdAt: new Date().toISOString(),
  email: `${phone.replace(/\D/g, '')}@example.com`,
  avatar: `https://i.pravatar.cc/150?u=${phone}`,
  bio: 'Food enthusiast',
  location: 'Addis Ababa, Ethiopia',
  followers: Math.floor(Math.random() * 1000),
  following: Math.floor(Math.random() * 500),
  recipes: Math.floor(Math.random() * 50),
  reviews: Math.floor(Math.random() * 100),
});

// Define the auth store with proper types
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initialize with default values
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      phoneNumber: '',
      userRole: 'user' as UserRole,
      generatedOtp: '123456', // Default OTP for development

      login: async (phone: string, role: UserRole = 'user') => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, call the API to request OTP
          // const response = await authAPI.requestOtp(phone, role);
          
          // For demo, simulate API call with timeout
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate a 6-digit OTP for demo purposes
          const otp = '123456';
          console.log('Generated OTP:', otp);
          
          set({
            phoneNumber: phone,
            generatedOtp: otp,
            userRole: role,
          });
          
          return otp;
        } catch (error: any) {
          console.error('Login error:', error);
          const errorMessage = error.message || 'Failed to send OTP. Please try again.';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      resendOtp: async () => {
        const { phoneNumber } = get();
        
        if (!phoneNumber) {
          throw new Error('No phone number found');
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Call the API to resend OTP
          const otp = await authAPI.resendOtp(phoneNumber);
          
          // In a real app, the OTP would be sent via SMS
          // For demo, we'll use the returned OTP and log it
          console.log('Resent OTP:', otp);
          
          set({ generatedOtp: otp });
          return otp;
        } catch (error: any) {
          console.error('Resend OTP error:', error);
          const errorMessage = error.message || 'Failed to resend OTP. Please try again.';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (userData: Partial<User>): Promise<void> => {
        set({ isLoading: true, error: null });
        
        try {
          // Call the API to update the user's profile
          const updatedUser = await authAPI.updateProfile(userData);
          
          if (!updatedUser) {
            throw new Error('Failed to update profile: No user data returned');
          }
          
          set({
            user: updatedUser,
            error: null,
            isAuthenticated: true,
          });
          
          // Update AsyncStorage
          const authData = await AsyncStorage.getItem('auth');
          if (authData) {
            const parsedAuth = JSON.parse(authData);
            await AsyncStorage.setItem('auth', JSON.stringify({
              ...parsedAuth,
              user: updatedUser,
              isAuthenticated: true,
            }));
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (otp: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const { phoneNumber, generatedOtp } = get();
          
          if (!phoneNumber) {
            throw new Error('Phone number not found. Please try again.');
          }
          
          // In a real app, verify OTP with the server
          // const response = await authAPI.verifyOtp(phoneNumber, otp);
          
          // For demo, simulate API call with timeout
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify OTP matches the generated one
          if (otp !== generatedOtp) {
            throw new Error('Invalid OTP. Please try again.');
          }
          
          // For demo, create a mock user
          const mockUser = createMockUser(phoneNumber, get().userRole);
          
          set({
            user: mockUser,
            isAuthenticated: true,
            token: `mock-jwt-token-${Date.now()}`,
            error: null,
          });
          
          // Store in AsyncStorage for persistence
          await AsyncStorage.setItem('auth', JSON.stringify({
            user: mockUser,
            token: `mock-jwt-token-${Date.now()}`,
            isAuthenticated: true,
          }));
          
          // For demo, treat as new user if no name is set
          const isNewUser = !mockUser.name;
          
          return isNewUser;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call the API to register the user
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // For demo, create a mock user
          const phone = userData.phone || get().phoneNumber || '';
          const user = createMockUser(phone, 'user');
          
          // Update with provided user data
          Object.assign(user, userData);
          
          set({
            user,
            isAuthenticated: true,
            token: `mock-jwt-token-${Date.now()}`,
            error: null,
          });
          
          return `user-${Date.now()}`; // Return user ID or token
        } catch (error) {
          console.error('Registration error:', error);
          set({ error: 'Registration failed. Please try again.' });
          return undefined;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          phoneNumber: null,
          userRole: "user",
          generatedOtp: null,
        });
      },

      followUser: async (userId) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update following count
          set({
            user: {
              ...currentUser,
              following: (currentUser.following || 0) + 1,
            },
          });
        } catch (error) {
          console.error("Follow user error:", error);
        }
      },
      
      unfollowUser: async (userId) => {
        const currentUser = get().user;
        if (!currentUser || !(currentUser.following && currentUser.following > 0)) return;
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update following count
          set({
            user: {
              ...currentUser,
              following: currentUser.following - 1,
            },
          });
        } catch (error) {
          console.error("Unfollow user error:", error);
        }
      },
      
      isFollowing: (userId) => {
        // In a real app, this would check if the current user is following the specified user
        // For demo purposes, return a random boolean
        return Math.random() > 0.5;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Add version and migration to handle any persisted state issues
      version: 1,
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // If coming from version 0, reset auth state
          return {
            ...persistedState,
            isAuthenticated: false,
            user: null,
            token: null
          };
        }
        return persistedState;
      },
    }
  )
);
