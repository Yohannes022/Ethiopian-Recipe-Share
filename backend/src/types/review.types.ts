import { Document, Model, Types } from 'mongoose';

export interface IReview extends Document {
  user: Types.ObjectId;
  restaurant: Types.ObjectId;
  rating: number;
  comment: string;
  images?: string[];
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewMethods {
  updateRating(newRating: number): void;
  addLike(userId: Types.ObjectId): void;
  removeLike(userId: Types.ObjectId): void;
}

export type ReviewModel = Model<IReview, {}, IReviewMethods>;

export interface IReviewWithDetails extends IReview {
  user?: {
    name: string;
    photo: string;
  };
  restaurant?: {
    name: string;
    image: string;
  };
}
