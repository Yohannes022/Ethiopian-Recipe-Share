import mongoose, { Schema, Document, Model } from 'mongoose';
import { IFavorite, IFavoriteMethods, FavoriteModel } from '@/types/favorite.types';

const favoriteSchema = new mongoose.Schema<IFavorite, FavoriteModel, IFavoriteMethods>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Favorite must belong to a user'],
    },
    type: {
      type: String,
      required: [true, 'Favorite must have a type'],
      enum: ['recipe', 'restaurant', 'menu'],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Favorite must have an item ID'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
favoriteSchema.index({ user: 1, type: 1, itemId: 1 }, { unique: true });

// Virtual populate
favoriteSchema.virtual('user', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  select: 'name photo',
});

favoriteSchema.virtual('item', {
  refPath: 'type',
  localField: 'itemId',
  foreignField: '_id',
  justOne: true,
  select: '_id name image',
});

// Instance methods
favoriteSchema.methods.updateType = function (newType: string) {
  this.type = newType;
};

// Create and export the model
const Favorite = mongoose.model<IFavorite, FavoriteModel>('Favorite', favoriteSchema);
export default Favorite;
