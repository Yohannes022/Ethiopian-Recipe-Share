// Application constants
export const APP_NAME = 'Ethiopian Recipe Share';
export const APP_VERSION = '1.0.0';
export const API_PREFIX = '/api/v1';

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// Regex patterns
export const REGEX = {
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/, // E.164 format
};

// Cache time in seconds
export const CACHE_TIME = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  FIFTEEN_MINUTES: 900,
  THIRTY_MINUTES: 1800,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
};

// User roles
export const ROLES = {
  USER: 'user',
  RESTAURANT_OWNER: 'restaurant_owner',
  ADMIN: 'admin',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  ON_DELIVERY: 'on_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  MOBILE_MONEY: 'mobile_money',
} as const;
