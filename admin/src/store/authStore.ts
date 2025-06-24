import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  userId: string | null;
  restaurantId: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, restaurantName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userRole: null,
  userId: null,
  restaurantId: null,
  token: null,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });

    try {
      // TODO: Implement actual API call
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      const { token, role, userId, restaurantId } = data;

      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userRole', role);
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('restaurantId', restaurantId);

      set({
        isAuthenticated: true,
        userRole: role,
        userId: userId,
        restaurantId: restaurantId,
        token: token,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  register: async (email: string, password: string, restaurantName: string) => {
    set({ loading: true, error: null });

    try {
      // TODO: Implement actual API call
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, restaurantName }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      const { token, role, userId, restaurantId } = data;

      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userRole', role);
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('restaurantId', restaurantId);

      set({
        isAuthenticated: true,
        userRole: role,
        userId: userId,
        restaurantId: restaurantId,
        token: token,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  logout: async () => {
    set({ loading: true });

    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('restaurantId');

      set({
        isAuthenticated: false,
        userRole: null,
        userId: null,
        restaurantId: null,
        token: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  updateToken: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const role = await AsyncStorage.getItem('userRole');
      const userId = await AsyncStorage.getItem('userId');
      const restaurantId = await AsyncStorage.getItem('restaurantId');

      if (token && role && userId && restaurantId) {
        set({
          isAuthenticated: true,
          userRole: role,
          userId: userId,
          restaurantId: restaurantId,
          token: token,
        });
      }
    } catch (error) {
      console.error('Error updating token:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
