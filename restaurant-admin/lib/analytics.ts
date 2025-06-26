import { api } from './api';
import { ENDPOINTS } from '@/constants/api';

export const analyticsAPI = {
  getAnalytics: async (restaurantId: string, period: string) => {
    try {
      return await api.get(
        `${ENDPOINTS.RESTAURANT_ANALYTICS(restaurantId)}?period=${period}`
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
};

export default analyticsAPI;
