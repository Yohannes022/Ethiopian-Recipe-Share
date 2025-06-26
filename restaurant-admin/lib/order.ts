import { api } from './api';
import { ENDPOINTS } from '@/constants/api';

export const orderAPI = {
  getOrders: async (restaurantId: string) => {
    try {
      return await api.get(ENDPOINTS.RESTAURANT_ORDERS(restaurantId));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },
  
  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      return await api.put(ENDPOINTS.ORDER_STATUS(orderId), { status });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
  
  getOrder: async (orderId: string) => {
    try {
      return await api.get(`${ENDPOINTS.ORDERS}/${orderId}`);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }
};

export default orderAPI;
