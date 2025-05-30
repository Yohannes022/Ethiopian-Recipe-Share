import { Document, Model, Types } from 'mongoose';

export interface INotification extends Document {
  user: Types.ObjectId;
  type: 'like' | 'comment' | 'follow' | 'review' | 'order' | 'message';
  message: string;
  read: boolean;
  relatedId: Types.ObjectId;
  relatedType: 'recipe' | 'restaurant' | 'review' | 'user' | 'order';
  createdAt: Date;
}

export interface INotificationMethods {
  markAsRead(): void;
  markAsUnread(): void;
}

export type NotificationModel = Model<INotification, {}, INotificationMethods>;

export interface INotificationWithDetails extends INotification {
  user?: {
    name: string;
    photo: string;
  };
  related?: {
    _id: Types.ObjectId;
    name: string;
    image?: string;
  };
}
