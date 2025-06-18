import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IReview extends Document {
  user: Types.ObjectId;
  restaurant: Types.ObjectId;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  reply?: {
    text: string;
    repliedBy: Types.ObjectId;
    repliedAt: Date;
  };
  helpfulVotes: Types.ObjectId[];
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Review must belong to a restaurant']
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    status: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.PENDING
    },
    reply: {
      text: {
        type: String,
        trim: true
      },
      repliedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      repliedAt: {
        type: Date
      }
    },
    helpfulVotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    helpfulCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster querying
reviewSchema.index({ restaurant: 1, status: 1 });
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });

// Update helpfulCount when helpfulVotes changes
reviewSchema.pre('save', function(next) {
  if (this.isModified('helpfulVotes')) {
    this.helpfulCount = this.helpfulVotes.length;
  }
  next();
});

// Update restaurant's average rating when a review is saved
reviewSchema.post('save', async function() {
  await updateRestaurantRating(this.restaurant);
});

// Update restaurant's average rating when a review is deleted
reviewSchema.post('deleteOne', async function(doc, next) {
  await updateRestaurantRating(doc.restaurant);
  next();
});

async function updateRestaurantRating(restaurantId: Types.ObjectId) {
  const result = await Review.aggregate([
    {
      $match: {
        restaurant: restaurantId,
        status: ReviewStatus.APPROVED
      }
    },
    {
      $group: {
        _id: '$restaurant',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
      rating: result[0].averageRating.toFixed(1),
      reviewCount: result[0].reviewCount
    });
  } else {
    await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
      rating: 0,
      reviewCount: 0
    });
  }
}

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
