import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/auth";
import { Address } from "@/types/restaurant";

export type PaymentMethod = {
  id: string;
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
};

export interface ProfileState {
  profiles: User[];
  followers: User[];
  following: User[];
  isLoading: boolean;
  error: string | null;
  addresses: Address[] | null;
  locationPermission: boolean | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  paymentMethods: PaymentMethod[];

  // Profile actions
  fetchProfile: (userId: string) => Promise<User | null>;
  fetchFollowers: (userId: string) => Promise<User[]>;
  fetchFollowing: (userId: string) => Promise<User[]>;
  
  // Social actions
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  
  // Address actions
  addAddress: (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Address>;
  updateAddress: (id: string, updates: Partial<Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<Address | null>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getAddresses: () => Promise<Address[]>;
  
  // Payment methods actions
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PaymentMethod>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  getPaymentMethods: () => Promise<PaymentMethod[]>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      followers: [],
      following: [],
      isLoading: false,
      error: null,
      addresses: null,
      locationPermission: null,
      location: null,
      paymentMethods: [],
      
      // Profile actions
      fetchProfile: async (userId: string) => {
        try {
          set({ isLoading: true });
          // TODO: Replace with actual API call
          // const response = await api.get(`/users/${userId}`);
          // return response.data;
          return null;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch profile' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchFollowers: async (userId: string) => {
        try {
          set({ isLoading: true });
          // TODO: Replace with actual API call
          // const response = await api.get(`/users/${userId}/followers`);
          // set({ followers: response.data });
          return [];
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch followers' });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      fetchFollowing: async (userId: string) => {
        try {
          set({ isLoading: true });
          // TODO: Replace with actual API call
          // const response = await api.get(`/users/${userId}/following`);
          // set({ following: response.data });
          return [];
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch following' });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      // Social actions
      followUser: async (userId: string) => {
        try {
          // TODO: Implement follow user API call
          // await api.post(`/users/${userId}/follow`);
          // Update local state if needed
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to follow user' });
          throw error;
        }
      },

      unfollowUser: async (userId: string) => {
        try {
          // TODO: Implement unfollow user API call
          // await api.post(`/users/${userId}/unfollow`);
          // Update local state if needed
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to unfollow user' });
          throw error;
        }
      },

      isFollowing: (userId: string) => {
        return get().following.some(user => user.id === userId);
      },

      // Address actions
      addAddress: async (address) => {
        try {
          const newAddress: Address = {
            ...address,
            id: `addr_${Math.random().toString(36).substr(2, 9)}`,
            isDefault: address.isDefault ?? false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            addresses: state.addresses ? [...state.addresses, newAddress] : [newAddress]
          }));
          
          return newAddress;
        } catch (error) {
          console.error('Error adding address:', error);
          throw error;
        }
      },

      updateAddress: async (id, updates) => {
        try {
          let updatedAddress: Address | null = null;
          
          set((state) => {
            if (!state.addresses) return state;
            
            const updatedAddresses = state.addresses.map(address => {
              if (address.id === id) {
                updatedAddress = {
                  ...address,
                  ...updates,
                  updatedAt: new Date().toISOString()
                };
                return updatedAddress;
              }
              return address;
            });
            
            return { addresses: updatedAddresses };
          });
          
          return updatedAddress;
        } catch (error) {
          console.error('Error updating address:', error);
          throw error;
        }
      },

      removeAddress: async (id: string) => {
        try {
          set((state) => {
            if (!state.addresses) return state;
            
            const addresses = state.addresses.filter(addr => addr.id !== id);
            // If we removed the default and there are other addresses, set the first one as default
            if (addresses.length > 0 && !addresses.some(addr => addr.isDefault)) {
              addresses[0].isDefault = true;
            }
            
            return { addresses };
          });
        } catch (error) {
          console.error('Error removing address:', error);
          throw error;
        }
      },

      setDefaultAddress: async (id: string) => {
        try {
          set((state) => {
            if (!state.addresses) return state;
            
            const updatedAddresses = state.addresses.map(address => ({
              ...address,
              isDefault: address.id === id
            }));
            
            return { addresses: updatedAddresses };
          });
        } catch (error) {
          console.error('Error setting default address:', error);
          throw error;
        }
      },

      getAddresses: async () => {
        try {
          return get().addresses || [];
        } catch (error) {
          console.error('Error getting addresses:', error);
          throw error;
        }
      },

      // Payment methods actions
      
      // Payment methods actions
      addPaymentMethod: async (paymentMethodData) => {
        try {
          const newPaymentMethod: PaymentMethod = {
            ...paymentMethodData,
            id: `pm_${Math.random().toString(36).substr(2, 9)}`,
            isDefault: paymentMethodData.isDefault ?? false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            paymentMethods: [...state.paymentMethods, newPaymentMethod]
          }));
          
          return newPaymentMethod;
        } catch (error) {
          console.error('Error adding payment method:', error);
          throw error;
        }
      },
      
      removePaymentMethod: async (id: string) => {
        try {
          set((state) => {
            const paymentMethods = state.paymentMethods.filter(method => method.id !== id);
            
            // If we removed the default and there are other methods, set the first one as default
            if (paymentMethods.length > 0 && !paymentMethods.some(m => m.isDefault)) {
              paymentMethods[0].isDefault = true;
            }
            
            return { paymentMethods };
          });
        } catch (error) {
          console.error('Error removing payment method:', error);
          throw error;
        }
      },
      
      setDefaultPaymentMethod: async (id: string) => {
        try {
          set((state) => ({
            paymentMethods: state.paymentMethods.map(method => ({
              ...method,
              isDefault: method.id === id
            }))
          }));
        } catch (error) {
          console.error('Error setting default payment method:', error);
          throw error;
        }
      },
      
      getPaymentMethods: async () => {
        try {
          return get().paymentMethods;
        } catch (error) {
          console.error('Error getting payment methods:', error);
          throw error;
        }
      },
      
      // ... (keep all other existing methods)
      
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
