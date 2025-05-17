import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Restaurant, MenuItem, Review } from "@/types/restaurant";
import { restaurantAPI } from "@/lib/api";

export interface RestaurantState {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  isLoading: boolean;
  error: string | null;
  
  // Restaurant actions
  fetchRestaurants: () => Promise<Restaurant[]>;
  fetchRestaurant: (id: string) => Promise<Restaurant | null>;
  fetchOwnerRestaurants: (ownerId: string) => Promise<Restaurant[]>;
  createRestaurant: (restaurantData: Partial<Restaurant>) => Promise<Restaurant | null>;
  updateRestaurant: (id: string, restaurantData: Partial<Restaurant>) => Promise<Restaurant | null>;
  
  // Menu actions
  addMenuItem: (restaurantId: string, menuItemData: Partial<MenuItem>) => Promise<MenuItem | null>;
  updateMenuItem: (restaurantId: string, itemId: string, menuItemData: Partial<MenuItem>) => Promise<MenuItem | null>;
  deleteMenuItem: (restaurantId: string, itemId: string) => Promise<boolean>;
  
  // Review actions
  addReview: (restaurantId: string, reviewData: Partial<Review>) => Promise<Review | null>;
}

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      restaurants: [],
      currentRestaurant: null,
      isLoading: false,
      error: null,
      
      fetchRestaurants: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Fetch restaurants from API
          const restaurants = await restaurantAPI.getRestaurants();
          
          set({ restaurants, isLoading: false });
          return restaurants;
        } catch (error) {
          console.error("Error fetching restaurants:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch restaurants. Please try again." 
          });
          return [];
        }
      },
      
      fetchRestaurant: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Check if restaurant is already in state
          const existingRestaurant = get().restaurants.find(r => r.id === id);
          
          if (existingRestaurant) {
            set({ currentRestaurant: existingRestaurant, isLoading: false });
            return existingRestaurant;
          }
          
          // Fetch restaurant from API
          const restaurant = await restaurantAPI.getRestaurant(id);
          
          if (restaurant) {
            set({ 
              currentRestaurant: restaurant,
              restaurants: [...get().restaurants.filter(r => r.id !== id), restaurant],
              isLoading: false 
            });
            return restaurant;
          }
          
          set({ 
            isLoading: false, 
            error: "Restaurant not found." 
          });
          return null;
        } catch (error) {
          console.error("Error fetching restaurant:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch restaurant. Please try again." 
          });
          return null;
        }
      },
      
      fetchOwnerRestaurants: async (ownerId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Fetch owner restaurants from API
          const restaurants = await restaurantAPI.getOwnerRestaurants(ownerId);
          
          set({ restaurants, isLoading: false });
          return restaurants;
        } catch (error) {
          console.error("Error fetching owner restaurants:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch your restaurants. Please try again." 
          });
          return [];
        }
      },
      
      createRestaurant: async (restaurantData: Partial<Restaurant>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create restaurant via API
          const newRestaurant = await restaurantAPI.createRestaurant(restaurantData);
          
          if (newRestaurant) {
            set(state => ({ 
              restaurants: [...state.restaurants, newRestaurant],
              currentRestaurant: newRestaurant,
              isLoading: false 
            }));
            return newRestaurant;
          }
          
          set({ 
            isLoading: false, 
            error: "Failed to create restaurant." 
          });
          return null;
        } catch (error) {
          console.error("Error creating restaurant:", error);
          set({ 
            isLoading: false, 
            error: "Failed to create restaurant. Please try again." 
          });
          return null;
        }
      },
      
      updateRestaurant: async (id: string, restaurantData: Partial<Restaurant>) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API to update the restaurant
          // For demo purposes, we'll update it locally
          
          const currentRestaurant = get().currentRestaurant;
          const restaurants = get().restaurants;
          
          if (!currentRestaurant || currentRestaurant.id !== id) {
            set({ 
              isLoading: false, 
              error: "Restaurant not found." 
            });
            return null;
          }
          
          // Update the restaurant
          const updatedRestaurant = {
            ...currentRestaurant,
            ...restaurantData,
            updatedAt: new Date().toISOString(),
          };
          
          // Update state
          set({ 
            currentRestaurant: updatedRestaurant,
            restaurants: restaurants.map(r => r.id === id ? updatedRestaurant : r),
            isLoading: false 
          });
          
          return updatedRestaurant;
        } catch (error) {
          console.error("Error updating restaurant:", error);
          set({ 
            isLoading: false, 
            error: "Failed to update restaurant. Please try again." 
          });
          return null;
        }
      },
      
      addMenuItem: async (restaurantId: string, menuItemData: Partial<MenuItem>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Add menu item via API
          const newMenuItem = await restaurantAPI.addMenuItem(restaurantId, menuItemData);
          
          if (newMenuItem) {
            // Update the current restaurant if it's the one we're adding to
            const currentRestaurant = get().currentRestaurant;
            
            if (currentRestaurant && currentRestaurant.id === restaurantId) {
              const updatedRestaurant = {
                ...currentRestaurant,
                menu: [...(currentRestaurant.menu || []), newMenuItem],
                updatedAt: new Date().toISOString(),
              };
              
              set({ 
                currentRestaurant: updatedRestaurant,
                isLoading: false 
              });
            } else {
              set({ isLoading: false });
            }
            
            return newMenuItem;
          }
          
          set({ 
            isLoading: false, 
            error: "Failed to add menu item." 
          });
          return null;
        } catch (error) {
          console.error("Error adding menu item:", error);
          set({ 
            isLoading: false, 
            error: "Failed to add menu item. Please try again." 
          });
          return null;
        }
      },
      
      updateMenuItem: async (restaurantId: string, itemId: string, menuItemData: Partial<MenuItem>) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API to update the menu item
          // For demo purposes, we'll update it locally
          
          const currentRestaurant = get().currentRestaurant;
          
          if (!currentRestaurant || currentRestaurant.id !== restaurantId) {
            set({ 
              isLoading: false, 
              error: "Restaurant not found." 
            });
            return null;
          }
          
          // Find the menu item
          const menuItem = currentRestaurant.menu?.find(item => item.id === itemId);
          
          if (!menuItem) {
            set({ 
              isLoading: false, 
              error: "Menu item not found." 
            });
            return null;
          }
          
          // Update the menu item
          const updatedMenuItem = {
            ...menuItem,
            ...menuItemData,
            updatedAt: new Date().toISOString(),
          };
          
          // Update the restaurant
          const updatedRestaurant = {
            ...currentRestaurant,
            menu: currentRestaurant.menu?.map(item => item.id === itemId ? updatedMenuItem : item),
            updatedAt: new Date().toISOString(),
          };
          
          // Update state
          set({ 
            currentRestaurant: updatedRestaurant,
            isLoading: false 
          });
          
          return updatedMenuItem;
        } catch (error) {
          console.error("Error updating menu item:", error);
          set({ 
            isLoading: false, 
            error: "Failed to update menu item. Please try again." 
          });
          return null;
        }
      },
      
      deleteMenuItem: async (restaurantId: string, itemId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API to delete the menu item
          // For demo purposes, we'll delete it locally
          
          const currentRestaurant = get().currentRestaurant;
          
          if (!currentRestaurant || currentRestaurant.id !== restaurantId) {
            set({ 
              isLoading: false, 
              error: "Restaurant not found." 
            });
            return false;
          }
          
          // Update the restaurant
          const updatedRestaurant = {
            ...currentRestaurant,
            menu: currentRestaurant.menu?.filter(item => item.id !== itemId),
            updatedAt: new Date().toISOString(),
          };
          
          // Update state
          set({ 
            currentRestaurant: updatedRestaurant,
            isLoading: false 
          });
          
          return true;
        } catch (error) {
          console.error("Error deleting menu item:", error);
          set({ 
            isLoading: false, 
            error: "Failed to delete menu item. Please try again." 
          });
          return false;
        }
      },
      
      addReview: async (restaurantId: string, reviewData: Partial<Review>) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API to add the review
          // For demo purposes, we'll add it locally
          
          const currentRestaurant = get().currentRestaurant;
          const restaurants = get().restaurants;
          
          if (!currentRestaurant || currentRestaurant.id !== restaurantId) {
            set({ 
              isLoading: false, 
              error: "Restaurant not found." 
            });
            return null;
          }
          
          // Create the review
          const newReview: Review = {
            id: `review-${Math.random().toString(36).substring(2, 9)}`,
            ...reviewData,
            restaurantId,
            createdAt: new Date().toISOString(),
          } as Review;
          
          // Calculate new rating
          const currentRating = currentRestaurant.rating || 0;
          const currentCount = currentRestaurant.reviewCount || 0;
          const newRating = reviewData.rating 
            ? ((currentRating * currentCount) + reviewData.rating) / (currentCount + 1)
            : currentRating;
          
          // Update the restaurant
          const updatedRestaurant = {
            ...currentRestaurant,
            reviews: [...(currentRestaurant.reviews || []), newReview],
            rating: newRating,
            reviewCount: currentCount + 1,
            updatedAt: new Date().toISOString(),
          };
          
          // Update state
          set({ 
            currentRestaurant: updatedRestaurant,
            restaurants: restaurants.map(r => r.id === restaurantId ? updatedRestaurant : r),
            isLoading: false 
          });
          
          return newReview;
        } catch (error) {
          console.error("Error adding review:", error);
          set({ 
            isLoading: false, 
            error: "Failed to add review. Please try again." 
          });
          return null;
        }
      },
    }),
    {
      name: "restaurant-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
