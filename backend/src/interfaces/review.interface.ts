import { Document } from 'mongoose';

export interface IReview extends Document {
  userId: string;
  targetId: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  userDetails?: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
