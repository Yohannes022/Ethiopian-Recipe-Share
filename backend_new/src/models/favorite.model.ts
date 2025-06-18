import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './user.model';
import { IRecipe } from './recipe.model';
import { IRestaurant } from './restaurant.model';

export interface IFavorite extends Document {
  user: Types.ObjectId | IUser;
  type: 'recipe' | 'restaurant';
  itemId: Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['recipe', 'restaurant'],
    required: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
favoriteSchema.index({ user: 1, type: 1, itemId: 1 }, { unique: true });
favoriteSchema.index({ user: 1 });
favoriteSchema.index({ createdAt: -1 });

// Virtual for the referenced item
favoriteSchema.virtual('item', {
  ref: (doc: IFavorite) => doc.type,
  localField: 'itemId',
  foreignField: '_id'
});

const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);

export default Favorite;
