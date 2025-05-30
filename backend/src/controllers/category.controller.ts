import { Request, Response, NextFunction } from 'express';
import Category from '@/models/Category';
import { BadRequestError, NotFoundError } from '@/utils/apiError';
import { ICategory } from '@/types/category.types';
import { protect, restrictTo } from '../middleware/auth';

// Get all categories with filters
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract query parameters
    const {
      name,
      type,
      parent,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query: any = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (type) query.type = type;
    if (parent) query.parent = parent;

    // Build sort
    const sortOptions: any = {};
    if (sort === 'name') sortOptions.name = 1;
    else if (sort === '-name') sortOptions.name = -1;
    else sortOptions.createdAt = -1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count
    const total = await Category.countDocuments(query);

    // Get categories
    const categories = await Category.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('parent', 'name');

    // Get all categories with children for hierarchical structure
    const categoriesWithChildren = await Category.find(query)
      .populate('children', 'name description type icon image');

    res.status(200).json({
      status: 'success',
      results: categories.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: {
        categories,
        hierarchy: categoriesWithChildren,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new category
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new BadRequestError('You must be an admin to create categories');
    }

    const category = await Category.create(req.body);

    // If category has a parent, update parent's children
    if (req.body.parent) {
      await Category.findByIdAndUpdate(req.body.parent, {
        $push: { children: category._id },
      });
    }

    res.status(201).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name')
      .populate('children', 'name description type icon image');

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Update category
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new BadRequestError('You must be an admin to update categories');
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('parent', 'name').populate('children', 'name description type icon image');

    // Update parent-child relationships if parent changed
    if (req.body.parent && req.body.parent !== category.parent) {
      // Remove from old parent's children
      if (category.parent) {
        await Category.findByIdAndUpdate(category.parent, {
          $pull: { children: category._id },
        });
      }

      // Add to new parent's children
      await Category.findByIdAndUpdate(req.body.parent, {
        $push: { children: category._id },
      });
    }

    res.status(200).json({
      status: 'success',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new BadRequestError('You must be an admin to delete categories');
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Remove category from parent's children
    if (category.parent) {
      await Category.findByIdAndUpdate(category.parent, {
        $pull: { children: category._id },
      });
    }

    // Delete category and all its children recursively
    await deleteCategoryAndChildren(category._id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to recursively delete category and its children
const deleteCategoryAndChildren = async (categoryId: any) => {
  // Get all children of this category
  const children = await Category.find({ parent: categoryId });

  // Delete all children recursively
  for (const child of children) {
    await deleteCategoryAndChildren(child._id);
  }

  // Delete the category itself
  await Category.findByIdAndDelete(categoryId);
};
