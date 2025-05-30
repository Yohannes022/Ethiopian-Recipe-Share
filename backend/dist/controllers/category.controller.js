"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.createCategory = exports.getAllCategories = void 0;
const Category_1 = __importDefault(require("@/models/Category"));
const apiError_1 = require("@/utils/apiError");
// Get all categories with filters
const getAllCategories = async (req, res, next) => {
    try {
        // Extract query parameters
        const { name, type, parent, sort, page = 1, limit = 10, } = req.query;
        // Build query
        const query = {};
        if (name)
            query.name = { $regex: name, $options: 'i' };
        if (type)
            query.type = type;
        if (parent)
            query.parent = parent;
        // Build sort
        const sortOptions = {};
        if (sort === 'name')
            sortOptions.name = 1;
        else if (sort === '-name')
            sortOptions.name = -1;
        else
            sortOptions.createdAt = -1;
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get total count
        const total = await Category_1.default.countDocuments(query);
        // Get categories
        const categories = await Category_1.default.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .populate('parent', 'name');
        // Get all categories with children for hierarchical structure
        const categoriesWithChildren = await Category_1.default.find(query)
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCategories = getAllCategories;
// Create new category
const createCategory = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            throw new apiError_1.BadRequestError('You must be an admin to create categories');
        }
        const category = await Category_1.default.create(req.body);
        // If category has a parent, update parent's children
        if (req.body.parent) {
            await Category_1.default.findByIdAndUpdate(req.body.parent, {
                $push: { children: category._id },
            });
        }
        res.status(201).json({
            status: 'success',
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
// Get category by ID
const getCategory = async (req, res, next) => {
    try {
        const category = await Category_1.default.findById(req.params.id)
            .populate('parent', 'name')
            .populate('children', 'name description type icon image');
        if (!category) {
            throw new apiError_1.NotFoundError('Category not found');
        }
        res.status(200).json({
            status: 'success',
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategory = getCategory;
// Update category
const updateCategory = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            throw new apiError_1.BadRequestError('You must be an admin to update categories');
        }
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            throw new apiError_1.NotFoundError('Category not found');
        }
        // Update category
        const updatedCategory = await Category_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('parent', 'name').populate('children', 'name description type icon image');
        // Update parent-child relationships if parent changed
        if (req.body.parent && req.body.parent !== category.parent) {
            // Remove from old parent's children
            if (category.parent) {
                await Category_1.default.findByIdAndUpdate(category.parent, {
                    $pull: { children: category._id },
                });
            }
            // Add to new parent's children
            await Category_1.default.findByIdAndUpdate(req.body.parent, {
                $push: { children: category._id },
            });
        }
        res.status(200).json({
            status: 'success',
            data: updatedCategory,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
// Delete category
const deleteCategory = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            throw new apiError_1.BadRequestError('You must be an admin to delete categories');
        }
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            throw new apiError_1.NotFoundError('Category not found');
        }
        // Remove category from parent's children
        if (category.parent) {
            await Category_1.default.findByIdAndUpdate(category.parent, {
                $pull: { children: category._id },
            });
        }
        // Delete category and all its children recursively
        await deleteCategoryAndChildren(category._id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
// Helper function to recursively delete category and its children
const deleteCategoryAndChildren = async (categoryId) => {
    // Get all children of this category
    const children = await Category_1.default.find({ parent: categoryId });
    // Delete all children recursively
    for (const child of children) {
        await deleteCategoryAndChildren(child._id);
    }
    // Delete the category itself
    await Category_1.default.findByIdAndDelete(categoryId);
};
