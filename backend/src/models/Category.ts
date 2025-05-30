import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICategory, ICategoryMethods, CategoryModel } from '@/types/category.types';

const categorySchema = new mongoose.Schema<ICategory, CategoryModel, ICategoryMethods>(
  {
    name: {
      type: String,
      required: [true, 'Category must have a name'],
      trim: true,
      maxlength: [100, 'Category name must be less than 100 characters'],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Category must have a type'],
      enum: ['recipe', 'restaurant', 'menu'],
    },
    icon: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ type: 1 });

// Virtual populate for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Instance methods
categorySchema.methods.updateIcon = function (newIcon: string) {
  this.icon = newIcon;
};

categorySchema.methods.updateImage = function (newImage: string) {
  this.image = newImage;
};

// Pre-save middleware to ensure parent category exists
categorySchema.pre('save', async function (next) {
  if (this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (!parent) {
      throw new Error('Parent category does not exist');
    }
  }
  next();
});

// Create and export the model
const Category = mongoose.model<ICategory, CategoryModel>('Category', categorySchema);
export default Category;
