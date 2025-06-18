import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './user.model';
import { IRecipe } from './recipe.model';
import { IRestaurant } from './restaurant.model';

export interface INotification extends Document {
  user: Types.ObjectId | IUser;
  type: 'recipe' | 'restaurant' | 'order' | 'review' | 'comment';
  content: string;
  read: boolean;
  referenceId: Types.ObjectId;
  referenceType: 'recipe' | 'restaurant' | 'order' | 'review' | 'comment';
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['recipe', 'restaurant', 'order', 'review', 'comment'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  referenceType: {
    type: String,
    enum: ['recipe', 'restaurant', 'order', 'review', 'comment'],
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
notificationSchema.index({ user: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for reference object
notificationSchema.virtual('reference', {
  ref: (doc: INotification) => doc.referenceType,
  localField: 'referenceId',
  foreignField: '_id'
});

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
