import { Document, Model, Types } from 'mongoose';

export interface IReviewBase {
  restaurant: Types.ObjectId;
  rating: number;
  comment: string;
  images?: string[];
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview extends Document, IReviewBase {
  user: Types.ObjectId;
}

export interface IReviewWithDetails extends IReview {
  userInfo?: {
    name: string;
    photo: string;
  };
  restaurantInfo?: {
    name: string;
    image: string;
  };
}

export interface IReviewMethods {
  updateRating(newRating: number): void;
  addLike(userId: Types.ObjectId): void;
  removeLike(userId: Types.ObjectId): void;
}

export type ReviewModel = Model<IReview, {}, IReviewMethods>;
