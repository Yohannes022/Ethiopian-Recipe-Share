import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  review: string;
  rating: number;
  user: Types.ObjectId | string;
  restaurant?: Types.ObjectId | string;
  menuItem?: Types.ObjectId | string;
  order?: Types.ObjectId | string;
  targetType: 'Restaurant' | 'MenuItem';
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      trim: true,
      maxlength: [1000, 'Review cannot be longer than 1000 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [
        function (this: IReview) {
          return this.targetType === 'Restaurant';
        },
        'Restaurant is required for restaurant reviews',
      ],
    },
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: [
        function (this: IReview) {
          return this.targetType === 'MenuItem';
        },
        'Menu item is required for menu item reviews',
      ],
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    targetType: {
      type: String,
      required: [true, 'Review must have a target type'],
      enum: {
        values: ['Restaurant', 'MenuItem'],
        message: 'Target type is either: Restaurant or MenuItem',
      },
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure one review per user per target
reviewSchema.index(
  { user: 1, restaurant: 1 },
  { unique: true, partialFilterExpression: { restaurant: { $exists: true } } }
);

reviewSchema.index(
  { user: 1, menuItem: 1 },
  { unique: true, partialFilterExpression: { menuItem: { $exists: true } } }
);

// Populate user data when querying reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Static method to calculate average rating for a restaurant or menu item
reviewSchema.statics.calcAverageRatings = async function (targetId: Types.ObjectId, targetType: 'Restaurant' | 'MenuItem') {
  const stats = await this.aggregate([
    {
      $match: { 
        [targetType.toLowerCase()]: targetId,
        rating: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: `$${targetType.toLowerCase()}`,
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const Model = targetType === 'Restaurant' ? 'Restaurant' : 'MenuItem';
  
  if (stats.length > 0) {
    await mongoose.model(Model).findByIdAndUpdate(targetId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].nRating,
    });
  } else {
    await mongoose.model(Model).findByIdAndUpdate(targetId, {
      rating: 0,
      numReviews: 0,
    });
  }
};

// Update restaurant/menu item rating after saving a review
reviewSchema.post('save', function (doc) {
  const targetId = doc.restaurant || doc.menuItem;
  const targetType = doc.targetType;
  
  if (targetId) {
    // @ts-ignore
    this.constructor.calcAverageRatings(targetId, targetType);
  }
});

// Update restaurant/menu item rating after updating or deleting a review
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    const targetId = doc.restaurant || doc.menuItem;
    const targetType = doc.targetType;
    
    if (targetId) {
      // @ts-ignore
      await doc.constructor.calcAverageRatings(targetId, targetType);
    }
  }
});

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
