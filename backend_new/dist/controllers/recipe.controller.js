"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRecipes = exports.rateRecipe = exports.addComment = exports.likeRecipe = exports.deleteRecipe = exports.updateRecipe = exports.createRecipe = exports.getRecipe = exports.getAllRecipes = void 0;
const recipe_model_1 = __importDefault(require("@/models/recipe.model"));
const appError_1 = __importDefault(require("@/utils/appError"));
const RecipeModel = recipe_model_1.default;
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
};
const getAllRecipes = async (req, res, next) => {
    try {
        const filter = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete filter[el]);
        let queryStr = JSON.stringify(filter);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const queryFilter = JSON.parse(queryStr);
        let query = recipe_model_1.default.find(queryFilter).lean();
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else {
            query = query.sort('-createdAt');
        }
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }
        else {
            query = query.select('-__v');
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const numRecipes = await recipe_model_1.default.countDocuments();
            if (skip >= numRecipes)
                throw new Error('This page does not exist');
        }
        const recipes = await query.populate({
            path: 'user',
            select: 'name photo'
        });
        res.status(200).json({
            status: 'success',
            results: recipes.length,
            data: {
                recipes
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllRecipes = getAllRecipes;
const getRecipe = async (req, res, next) => {
    try {
        const recipe = await recipe_model_1.default.findById(req.params.id)
            .populate({
            path: 'user',
            select: 'name photo'
        })
            .lean()
            .exec();
        if (!recipe) {
            return next(new appError_1.default('No recipe found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                recipe
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getRecipe = getRecipe;
const createRecipe = async (req, res, next) => {
    try {
        if (!req.body.user)
            req.body.user = req.user.id;
        const newRecipe = await recipe_model_1.default.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                recipe: newRecipe
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createRecipe = createRecipe;
const updateRecipe = async (req, res, next) => {
    try {
        const filteredBody = filterObj(req.body, 'title', 'description', 'ingredients', 'instructions', 'prepTime', 'cookTime', 'servings', 'difficulty', 'cuisine', 'mealType', 'dietaryRestrictions', 'image', 'isPublic');
        const updatedRecipe = await recipe_model_1.default.findByIdAndUpdate(req.params.id, filteredBody, {
            new: true,
            runValidators: true
        })
            .populate('user', 'name photo')
            .lean()
            .exec();
        if (!updatedRecipe) {
            return next(new appError_1.default('No recipe found with that ID', 404));
        }
        const recipeUser = updatedRecipe.user;
        const recipeUserId = recipeUser?._id?.toString() || recipeUser.toString();
        if (recipeUserId !== req.user?._id?.toString()) {
            return next(new appError_1.default('You do not have permission to perform this action', 403));
        }
        res.status(200).json({
            status: 'success',
            data: {
                recipe: updatedRecipe
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateRecipe = updateRecipe;
const deleteRecipe = async (req, res, next) => {
    try {
        const recipe = await recipe_model_1.default.findById(req.params.id);
        if (!recipe) {
            return next(new appError_1.default('No recipe found with that ID', 404));
        }
        const recipeUser = recipe.user;
        const recipeUserId = recipeUser?._id?.toString() || recipeUser.toString();
        if (recipeUserId !== req.user?._id?.toString()) {
            return next(new appError_1.default('You do not have permission to perform this action', 403));
        }
        await recipe_model_1.default.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteRecipe = deleteRecipe;
const likeRecipe = async (req, res, next) => {
    try {
        const recipe = await recipe_model_1.default.findById(req.params.id);
        const userId = req.user.id;
        if (!recipe) {
            return next(new appError_1.default('No recipe found with that ID', 404));
        }
        const isLiked = recipe.likes.includes(userId);
        if (isLiked) {
            recipe.likes = recipe.likes.filter((id) => id.toString() !== userId.toString());
        }
        else {
            recipe.likes.push(userId);
        }
        await recipe.save({ validateBeforeSave: false });
        res.status(200).json({
            status: 'success',
            data: {
                recipe
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.likeRecipe = likeRecipe;
const addComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return next(new appError_1.default('Please provide comment text', 400));
        }
        const recipe = await recipe_model_1.default.findById(req.params.id);
        if (!recipe) {
            return next(new appError_1.default('No recipe found with that ID', 404));
        }
        const newComment = {
            user: req.user.id,
            text,
            createdAt: new Date()
        };
        recipe.comments.push(newComment);
        await recipe.save({ validateBeforeSave: false });
        await recipe.populate({
            path: 'comments.user',
            select: 'name photo'
        });
        const addedComment = recipe.comments[recipe.comments.length - 1];
        res.status(201).json({
            status: 'success',
            data: {
                comment: addedComment
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.addComment = addComment;
const rateRecipe = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user?._id;
        if (!userId) {
            return next(new appError_1.default('User not authenticated', 401));
        }
        const recipe = await recipe_model_1.default.findById(req.params.id);
        if (!recipe) {
            return next(new appError_1.default('No recipe found with that ID', 404));
        }
        const existingRatingIndex = recipe.ratings.findIndex((r) => r.user && r.user.toString() === userId.toString());
        const ratingObj = {
            user: userId,
            rating,
            comment: comment || ''
        };
        if (existingRatingIndex >= 0) {
            recipe.ratings[existingRatingIndex] = ratingObj;
        }
        else {
            recipe.ratings.push(ratingObj);
        }
        await recipe.save();
        res.status(200).json({
            status: 'success',
            data: {
                recipe
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.rateRecipe = rateRecipe;
const searchRecipes = async (req, res, next) => {
    try {
        const { q, cuisine, difficulty, mealType, dietaryRestrictions, maxPrepTime, maxCookTime, minRating, sortBy = 'relevance', page = 1, limit = 10 } = req.query;
        const query = { isPublic: true };
        if (q && typeof q === 'string') {
            query.$text = { $search: q };
        }
        if (cuisine) {
            query.cuisine = typeof cuisine === 'string' ? cuisine : { $in: cuisine };
        }
        if (difficulty) {
            query.difficulty = typeof difficulty === 'string' ? difficulty : { $in: difficulty };
        }
        if (mealType) {
            query.mealType = typeof mealType === 'string' ? mealType : { $in: mealType };
        }
        if (dietaryRestrictions) {
            query.dietaryRestrictions = {
                $in: typeof dietaryRestrictions === 'string' ? [dietaryRestrictions] : dietaryRestrictions
            };
        }
        if (maxPrepTime) {
            query.prepTime = { $lte: Number(maxPrepTime) };
        }
        if (maxCookTime) {
            query.cookTime = { $lte: Number(maxCookTime) };
        }
        if (minRating) {
            query.averageRating = { $gte: Number(minRating) };
        }
        let sort = {};
        switch (sortBy) {
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'rating':
                sort = { averageRating: -1 };
                break;
            case 'prepTime':
                sort = { prepTime: 1 };
                break;
            case 'cookTime':
                sort = { cookTime: 1 };
                break;
            default:
                if (q) {
                    sort = { score: { $meta: 'textScore' } };
                }
                else {
                    sort = { createdAt: -1 };
                }
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [recipes, total] = await Promise.all([
            recipe_model_1.default.find(query)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate({
                path: 'user',
                select: 'name photo'
            })
                .lean(),
            recipe_model_1.default.countDocuments(query)
        ]);
        const totalPages = Math.ceil(total / Number(limit));
        res.status(200).json({
            status: 'success',
            results: recipes.length,
            total,
            totalPages,
            currentPage: Number(page),
            data: {
                recipes
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.searchRecipes = searchRecipes;
//# sourceMappingURL=recipe.controller.js.map