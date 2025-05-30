import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Review {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Recipe', required: true })
  targetId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String, maxlength: 1000 })
  comment?: string;

  @Prop({ type: Boolean, default: false })
  isApproved: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  // Virtual for user details
  @Prop({
    type: {
      name: String,
      avatar: String,
    },
  })
  userDetails?: {
    name: string;
    avatar?: string;
  };
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes
ReviewSchema.index({ userId: 1, targetId: 1 }, { unique: true });
ReviewSchema.index({ targetId: 1, rating: 1 });
ReviewSchema.index({ createdAt: -1 });

// Pre-save hook to update timestamps
ReviewSchema.pre<ReviewDocument>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for user population
ReviewSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for recipe population
ReviewSchema.virtual('recipe', {
  ref: 'Recipe',
  localField: 'targetId',
  foreignField: '_id',
  justOne: true,
});
