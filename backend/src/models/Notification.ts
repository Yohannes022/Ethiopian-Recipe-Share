import mongoose, { Document, Schema, Types } from 'mongoose';

export enum NotificationType {
  ORDER_RECEIVED = 'order_received',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_PREPARING = 'order_preparing',
  ORDER_READY = 'order_ready',
  ORDER_ON_THE_WAY = 'order_on_the_way',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  NEW_REVIEW = 'new_review',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  OTHER = 'other',
}

export interface INotification extends Document {
  user: Types.ObjectId | string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedEntity?: {
    kind: 'Order' | 'Review' | 'Restaurant' | 'MenuItem' | 'User';
    id: Types.ObjectId | string;
  };
  metadata?: Record<string, any>;
  expiresAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A notification must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'A notification must have a title'],
      trim: true,
      maxlength: [100, 'Title cannot be longer than 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'A notification must have a message'],
      trim: true,
      maxlength: [500, 'Message cannot be longer than 500 characters'],
    },
    type: {
      type: String,
      required: [true, 'A notification must have a type'],
      enum: {
        values: Object.values(NotificationType),
        message: 'Notification type is either: ' + Object.values(NotificationType).join(', '),
      },
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedEntity: {
      kind: {
        type: String,
        enum: ['Order', 'Review', 'Restaurant', 'MenuItem', 'User'],
      },
      id: {
        type: Schema.Types.ObjectId,
        refPath: 'relatedEntity.kind',
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
      index: { expires: 0 }, // TTL index
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'relatedEntity.id': 1, 'relatedEntity.kind': 1 });

// Document middleware to set readAt when isRead is set to true
notificationSchema.pre<INotification>('save', function (next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method to create a notification
notificationSchema.statics.createNotification = async function (
  userId: Types.ObjectId | string,
  title: string,
  message: string,
  type: NotificationType,
  relatedEntity?: { kind: string; id: Types.ObjectId | string },
  metadata?: Record<string, any>,
  expiresInDays?: number
) {
  const notificationData: any = {
    user: userId,
    title,
    message,
    type,
  };

  if (relatedEntity) {
    notificationData.relatedEntity = relatedEntity;
  }

  if (metadata) {
    notificationData.metadata = metadata;
  }

  if (expiresInDays) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    notificationData.expiresAt = expiresAt;
  }

  return await this.create(notificationData);
};

// Static method to mark all user notifications as read
notificationSchema.statics.markAllAsRead = async function (userId: Types.ObjectId | string) {
  return await this.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

// Static method to get unread notifications count for a user
notificationSchema.statics.getUnreadCount = async function (userId: Types.ObjectId | string) {
  return await this.countDocuments({ user: userId, isRead: false });
};

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
