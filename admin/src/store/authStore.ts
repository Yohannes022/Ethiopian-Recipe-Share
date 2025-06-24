import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  userRole: 'owner' | 'manager' | null;
  userId: string | null;
  restaurantId: string | null;
  token: string | null;
  login: (token: string, role: 'owner' | 'manager', userId: string, restaurantId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userRole: null,
  userId: null,
  restaurantId: null,
  token: null,
  login: (token, role, userId, restaurantId) =>
    set({
      isAuthenticated: true,
      userRole: role,
      userId,
      restaurantId,
      token,
    }),
  logout: () =>
    set({
      isAuthenticated: false,
      userRole: null,
      userId: null,
      restaurantId: null,
      token: null,
    }),
}));
