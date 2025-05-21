export const API_CONFIG = {
  BASE_URL: "http://localhost:8000",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const ENDPOINTS = {
  // Restaurants
  RESTAURANTS: "/restaurants",
  RESTAURANT: (id: string) => `/restaurants/${id}`,
  
  // Menu
  MENU: "/menu",
  ADD_MENU_ITEM: "/menu",
  
  // Orders
  CREATE_ORDER: "/orders",
  USER_ORDERS: "/orders/user",
  RESTAURANT_ORDERS: "/orders/restaurant",
  UPDATE_ORDER_STATUS: "/orders/status",
  
  // Recipes
  RECIPES: "/recipes",
  RECIPE: (id: string) => `/recipes/${id}`,
  ADD_COMMENT: "/recipes/comments",
  
  // Analytics
  RESTAURANT_ANALYTICS: "/analytics"
};
