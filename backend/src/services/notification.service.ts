import { Types } from 'mongoose';
import { Notification, INotification } from '../models/Notification';
import { User } from '../models/User';
import { ApiError } from '../utils/api-error';
import { emailService } from './email.service';

type NotificationType = 
  | 'new_order'
  | 'order_status_changed'
  | 'new_review'
  | 'new_follower'
  | 'new_message';

interface CreateNotificationParams {
  userId: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: 'order' | 'review' | 'user' | 'restaurant' | 'recipe';
  relatedEntityId?: Types.ObjectId | string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification({
    userId,
    type,
    title,
    message,
    relatedEntityType,
    relatedEntityId,
    metadata = {},
    sendEmail = false,
  }: CreateNotificationParams): Promise<INotification> {
    try {
      // Create the notification
      const notification = new Notification({
        user: userId,
        type,
        title,
        message,
        isRead: false,
        relatedEntity: relatedEntityId ? {
          type: relatedEntityType,
          id: relatedEntityId,
        } : undefined,
        metadata,
      });

      await notification.save();

      // Send email notification if enabled
      if (sendEmail) {
        await this.sendEmailNotification(userId, { title, message });
      }

      // TODO: Implement push notification
      // await this.sendPushNotification(userId, { title, message });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new ApiError(500, 'Failed to create notification');
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return { count: result.modifiedCount };
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(
    userId: string,
    { page = 1, limit = 20, unreadOnly = false } = {}
  ) {
    const query: any = { user: userId };
    
    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await Notification.deleteOne({
      _id: notificationId,
      user: userId,
    });

    if (result.deletedCount === 0) {
      throw new ApiError(404, 'Notification not found');
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllUserNotifications(userId: string): Promise<{ count: number }> {
    const result = await Notification.deleteMany({ user: userId });
    return { count: result.deletedCount || 0 };
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    userId: Types.ObjectId | string,
    { title, message }: { title: string; message: string }
  ): Promise<void> {
    try {
      const user = await User.findById(userId).select('email name');
      
      if (!user || !user.email) {
        console.warn('User not found or has no email:', userId);
        return;
      }

      await emailService.sendEmail({
        to: user.email,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${title}</h2>
            <p>${message}</p>
            <p style="margin-top: 20px; color: #666;">
              You're receiving this email because you have notifications enabled on your account.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't throw error to prevent notification creation from failing
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({
      user: userId,
      isRead: false,
    });
  }

  /**
   * Create a system-wide notification
   */
  async createSystemNotification(
    title: string,
    message: string,
    userIds: (string | Types.ObjectId)[],
    options: {
      type?: NotificationType;
      relatedEntityType?: CreateNotificationParams['relatedEntityType'];
      relatedEntityId?: string | Types.ObjectId;
      metadata?: Record<string, any>;
      sendEmail?: boolean;
    } = {}
  ): Promise<INotification[]> {
    const {
      type = 'new_message',
      relatedEntityType,
      relatedEntityId,
      metadata = {},
      sendEmail = false,
    } = options;

    const notifications = userIds.map((userId) => ({
      user: userId,
      type,
      title,
      message,
      isRead: false,
      isSystem: true,
      relatedEntity: relatedEntityId ? {
        type: relatedEntityType,
        id: relatedEntityId,
      } : undefined,
      metadata,
    }));

    try {
      const createdNotifications = await Notification.insertMany(notifications);

      // Send email notifications if enabled
      if (sendEmail) {
        await Promise.all(
          createdNotifications.map((notification) =>
            this.sendEmailNotification(notification.user, {
              title: notification.title,
              message: notification.message,
            })
          )
        );
      }

      return createdNotifications;
    } catch (error) {
      console.error('Error creating system notifications:', error);
      throw new ApiError(500, 'Failed to create system notifications');
    }
  }
}

export const notificationService = new NotificationService();
