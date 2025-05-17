import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/auth";

export interface ProfileState {
  profiles: User[];
  followers: User[];
  following: User[];
  isLoading: boolean;
  error: string | null;
  
  // Profile actions
  fetchProfile: (userId: string) => Promise<User | null>;
  fetchFollowers: (userId: string) => Promise<User[]>;
  fetchFollowing: (userId: string) => Promise<User[]>;
  
  // Social actions
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      followers: [],
      following: [],
      isLoading: false,
      error: null,
      
      fetchProfile: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if profile is already in state
          const existingProfile = get().profiles.find(p => p.id === userId);
          if (existingProfile) {
            set({ isLoading: false });
            return existingProfile;
          }
          
          // Mock profile data
          const profile: User = {
            id: userId,
            name: "User " + userId.substring(0, 4),
            email: `user${userId.substring(0, 4)}@example.com`,
            phone: "+1 (555) 123-4567",
            avatar: `https://ui-avatars.com/api/?name=User+${userId.substring(0, 4)}&background=random`,
            bio: "Food enthusiast and home chef",
            location: "New York, NY",
            website: "https://example.com",
            followers: Math.floor(Math.random() * 500),
            following: Math.floor(Math.random() * 300),
            recipes: Math.floor(Math.random() * 50),
            reviews: Math.floor(Math.random() * 100),
            role: "user",
            createdAt: new Date().toISOString(),
          };
          
          // Update state
          set(state => ({
            profiles: [...state.profiles, profile],
            isLoading: false,
          }));
          
          return profile;
        } catch (error) {
          console.error("Error fetching profile:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch profile. Please try again." 
          });
          return null;
        }
      },
      
      fetchFollowers: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate mock followers
          const count = Math.floor(Math.random() * 20) + 5;
          const followers: User[] = Array.from({ length: count }, (_, i) => ({
            id: `follower-${i}-${Math.random().toString(36).substring(2, 7)}`,
            name: `Follower ${i + 1}`,
            email: `follower${i + 1}@example.com`,
            phone: "+1 (555) 123-4567",
            avatar: `https://ui-avatars.com/api/?name=Follower+${i + 1}&background=random`,
            bio: "Food lover",
            location: "Various locations",
            followers: Math.floor(Math.random() * 200),
            following: Math.floor(Math.random() * 150),
            recipes: Math.floor(Math.random() * 20),
            reviews: Math.floor(Math.random() * 40),
            role: "user",
            createdAt: new Date().toISOString(),
          }));
          
          set({ followers, isLoading: false });
          return followers;
        } catch (error) {
          console.error("Error fetching followers:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch followers. Please try again." 
          });
          return [];
        }
      },
      
      fetchFollowing: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate mock following
          const count = Math.floor(Math.random() * 15) + 3;
          const following: User[] = Array.from({ length: count }, (_, i) => ({
            id: `following-${i}-${Math.random().toString(36).substring(2, 7)}`,
            name: `Following ${i + 1}`,
            email: `following${i + 1}@example.com`,
            phone: "+1 (555) 123-4567",
            avatar: `https://ui-avatars.com/api/?name=Following+${i + 1}&background=random`,
            bio: "Chef and food blogger",
            location: "Various locations",
            followers: Math.floor(Math.random() * 300),
            following: Math.floor(Math.random() * 200),
            recipes: Math.floor(Math.random() * 30),
            reviews: Math.floor(Math.random() * 50),
            role: "user",
            createdAt: new Date().toISOString(),
          }));
          
          set({ following, isLoading: false });
          return following;
        } catch (error) {
          console.error("Error fetching following:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch following. Please try again." 
          });
          return [];
        }
      },
      
      followUser: async (userId: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update following list
          set(state => ({
            following: [
              ...state.following,
              {
                id: userId,
                name: `User ${userId.substring(0, 4)}`,
                email: `user${userId.substring(0, 4)}@example.com`,
                phone: "+1 (555) 123-4567",
                avatar: `https://ui-avatars.com/api/?name=User+${userId.substring(0, 4)}&background=random`,
                role: "user",
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        } catch (error) {
          console.error("Error following user:", error);
        }
      },
      
      unfollowUser: async (userId: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update following list
          set(state => ({
            following: state.following.filter(user => user.id !== userId),
          }));
        } catch (error) {
          console.error("Error unfollowing user:", error);
        }
      },
      
      isFollowing: (userId: string) => {
        return get().following.some(user => user.id === userId);
      },
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
