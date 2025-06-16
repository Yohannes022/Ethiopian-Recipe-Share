import { Document, Model, Types } from 'mongoose';

export interface INotificationBase {
  type: 'like' | 'comment' | 'follow' | 'review' | 'order' | 'message';
  message: string;
  read: boolean;
  relatedId: Types.ObjectId;
  relatedType: 'recipe' | 'restaurant' | 'review' | 'user' | 'order';
  createdAt: Date;
}

export interface INotification extends Document, INotificationBase {
  user: Types.ObjectId;
}

export interface INotificationWithDetails extends INotificationBase {
  user: Types.ObjectId;
  userInfo?: {
    name: string;
    photo: string;
  };
  related?: {
    _id: Types.ObjectId;
    name: string;
    image?: string;
  };
}

export interface INotificationMethods {
  markAsRead(): void;
  markAsUnread(): void;
}

export type NotificationModel = Model<INotification, {}, INotificationMethods>;
