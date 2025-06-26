import { api } from './api';

export const restaurantAPI = {
  // Get restaurant details
  getRestaurant: async (id: string) => {
    return api.get(`/restaurants/${id}`);
  },

  // Update restaurant details
  updateRestaurant: async (id: string, data: any) => {
    return api.put(`/restaurants/${id}`, data);
  },

  // Get restaurant menu
  getMenu: async (restaurantId: string) => {
    return api.get(`/restaurants/${restaurantId}/menu`);
  },

  // Add menu item
  addMenuItem: async (restaurantId: string, itemData: any) => {
    return api.post(`/restaurants/${restaurantId}/menu`, itemData);
  },

  // Update menu item
  updateMenuItem: async (restaurantId: string, itemId: string, itemData: any) => {
    return api.put(`/restaurants/${restaurantId}/menu/${itemId}`, itemData);
  },

  // Delete menu item
  deleteMenuItem: async (restaurantId: string, itemId: string) => {
    return api.delete(`/restaurants/${restaurantId}/menu/${itemId}`);
  },

  // Get restaurant orders
  getOrders: async (restaurantId: string, status?: string) => {
    const url = status 
      ? `/restaurants/${restaurantId}/orders?status=${status}`
      : `/restaurants/${restaurantId}/orders`;
    return api.get(url);
  },
};
