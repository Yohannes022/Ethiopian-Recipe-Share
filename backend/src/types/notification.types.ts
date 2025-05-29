import { Document, Types } from 'mongoose';

export enum NotificationType {
  // Order related
  ORDER_RECEIVED = 'order_received',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_PREPARING = 'order_preparing',
  ORDER_READY = 'order_ready',
  ORDER_ON_THE_WAY = 'order_on_the_way',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_READY_FOR_PICKUP = 'order_ready_for_pickup',
  ORDER_DELAYED = 'order_delayed',
  
  // Review related
  NEW_REVIEW = 'new_review',
  REVIEW_REPLY = 'review_reply',
  REVIEW_LIKED = 'review_liked',
  
  // Restaurant related
  RESTAURANT_APPROVED = 'restaurant_approved',
  RESTAURANT_REJECTED = 'restaurant_rejected',
  RESTAURANT_SUSPENDED = 'restaurant_suspended',
  RESTAURANT_FEATURED = 'restaurant_featured',
  
  // Menu item related
  MENU_ITEM_ADDED = 'menu_item_added',
  MENU_ITEM_UPDATED = 'menu_item_updated',
  MENU_ITEM_OUT_OF_STOCK = 'menu_item_out_of_stock',
  MENU_ITEM_BACK_IN_STOCK = 'menu_item_back_in_stock',
  
  // User related
  WELCOME = 'welcome',
  PASSWORD_CHANGED = 'password_changed',
  EMAIL_VERIFIED = 'email_verified',
  ACCOUNT_UPDATED = 'account_updated',
  
  // Promotion related
  NEW_PROMOTION = 'new_promotion',
  PROMOTION_STARTED = 'promotion_started',
  PROMOTION_ENDING_SOON = 'promotion_ending_soon',
  
  // System & Admin
  SYSTEM_UPDATE = 'system_update',
  MAINTENANCE_SCHEDULED = 'maintenance_scheduled',
  NEW_FEATURE = 'new_feature',
  
  // Other
  GENERAL = 'general',
  CUSTOM = 'custom',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
}

export interface INotificationAction {
  label: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  buttonVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  dismissOnClick?: boolean;
  data?: Record<string, any>;
}

export interface INotificationMetadata {
  // Related entity information
  relatedEntity?: {
    kind: string;
    id: Types.ObjectId | string;
    name?: string;
    url?: string;
  };
  
  // User who triggered the notification (if applicable)
  triggeredBy?: {
    id: Types.ObjectId | string;
    name: string;
    avatar?: string;
  };
  
  // Additional data specific to the notification type
  data?: Record<string, any>;
  
  // UI customization
  icon?: string;
  image?: string;
  color?: string;
  
  // Expiration and scheduling
  expiresAt?: Date;
  scheduledFor?: Date;
  
  // Priority and display settings
  priority?: NotificationPriority;
  isPersistent?: boolean;
  isDismissible?: boolean;
  
  // Tracking and analytics
  campaignId?: string;
  source?: string;
  tags?: string[];
}

export interface INotification extends Document {
  // Recipient information
  user: Types.ObjectId | string;
  
  // Notification content
  title: string;
  message: string;
  type: NotificationType;
  
  // Metadata and actions
  metadata?: INotificationMetadata;
  actions?: INotificationAction[];
  
  // Delivery and status
  channels: NotificationChannel[];
  isRead: boolean;
  readAt?: Date;
  isArchived: boolean;
  archivedAt?: Date;
  
  // Delivery status for each channel
  deliveryStatus: {
    inApp?: {
      delivered: boolean;
      deliveredAt?: Date;
      read: boolean;
      readAt?: Date;
    };
    email?: {
      sent: boolean;
      sentAt?: Date;
      delivered?: boolean;
      deliveredAt?: Date;
      opened?: boolean;
      openedAt?: Date;
      clicked?: boolean;
      clickedAt?: Date;
      error?: string;
    };
    sms?: {
      sent: boolean;
      sentAt?: Date;
      delivered?: boolean;
      deliveredAt?: Date;
      error?: string;
    };
    push?: {
      sent: boolean;
      sentAt?: Date;
      delivered?: boolean;
      deliveredAt?: Date;
      opened?: boolean;
      openedAt?: Date;
      error?: string;
    };
    whatsapp?: {
      sent: boolean;
      sentAt?: Date;
      delivered?: boolean;
      deliveredAt?: Date;
      read?: boolean;
      readAt?: Date;
      error?: string;
    };
  };
  
  // System fields
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface INotificationFilters {
  user: Types.ObjectId | string;
  type?: NotificationType | NotificationType[];
  isRead?: boolean;
  isArchived?: boolean;
  channel?: NotificationChannel;
  priority?: NotificationPriority | NotificationPriority[];
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'readAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface INotificationStats {
  total: number;
  read: number;
  unread: number;
  archived: number;
  byType: Array<{
    type: NotificationType;
    count: number;
  }>;
  byChannel: Array<{
    channel: NotificationChannel;
    count: number;
  }>;
  byPriority: Array<{
    priority: NotificationPriority;
    count: number;
  }>;
  recentNotifications: INotification[];
}

export interface ISendNotificationInput {
  userId: Types.ObjectId | string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: INotificationMetadata;
  actions?: INotificationAction[];
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  expiresInDays?: number;
  scheduleFor?: Date;
}

export interface IUpdateNotificationInput {
  isRead?: boolean;
  isArchived?: boolean;
  metadata?: INotificationMetadata;
  actions?: INotificationAction[];
  deliveryStatus?: INotification['deliveryStatus'];
}
