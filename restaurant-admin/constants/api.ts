export const API_CONFIG = {
  BASE_URL: "http://localhost:8000/api",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const ENDPOINTS = {
  // Auth
  REGISTER: "/users/register",
  LOGIN: "/auth/login",
  VERIFY_OTP: "/auth/verify-otp",
  RESEND_OTP: "/auth/resend-otp",
  
  // Restaurants
  RESTAURANTS: "/restaurants",
  RESTAURANT: (id: string) => `/restaurants/${id}`,
  OWNER_RESTAURANTS: (ownerId: string) => `/restaurants/owner/${ownerId}`,
  
  // Menu
  MENU: (restaurantId: string) => `/restaurants/${restaurantId}/menu`,
  MENU_ITEM: (restaurantId: string, itemId: string) => 
    `/restaurants/${restaurantId}/menu/${itemId}`,
  
  // Orders
  ORDERS: "/orders",
  USER_ORDERS: (userId: string) => `/orders/user/${userId}`,
  RESTAURANT_ORDERS: (restaurantId: string) => `/orders/restaurant/${restaurantId}`,
  ORDER_STATUS: (orderId: string) => `/orders/${orderId}/status`,
  
  // Recipes
  RECIPES: "/recipes",
  RECIPE: (id: string) => `/recipes/${id}`,
  RECIPE_COMMENTS: (recipeId: string) => `/recipes/${recipeId}/comments`,
  
  // Analytics
  RESTAURANT_ANALYTICS: (restaurantId: string) => 
    `/analytics/restaurant/${restaurantId}`,
};
