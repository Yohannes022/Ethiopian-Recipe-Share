"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recipe = void 0;
const mongoose_1 = require("mongoose");
const RecipeSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a recipe title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a recipe description'],
        trim: true,
    },
    ingredients: {
        type: [String],
        required: [true, 'Please provide recipe ingredients'],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Please provide at least one ingredient',
        },
    },
    instructions: {
        type: [String],
        required: [true, 'Please provide recipe instructions'],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Please provide at least one instruction',
        },
    },
    prepTime: {
        type: Number,
        required: [true, 'Please provide preparation time'],
        min: [0, 'Preparation time cannot be negative'],
    },
    cookTime: {
        type: Number,
        required: [true, 'Please provide cooking time'],
        min: [0, 'Cooking time cannot be negative'],
    },
    servings: {
        type: Number,
        required: [true, 'Please provide number of servings'],
        min: [1, 'Servings must be at least 1'],
    },
    difficulty: {
        type: String,
        required: [true, 'Please provide difficulty level'],
        enum: {
            values: ['easy', 'medium', 'hard'],
            message: 'Difficulty must be easy, medium, or hard',
        },
    },
    cuisine: {
        type: String,
        required: [true, 'Please provide cuisine type'],
        trim: true,
    },
    categories: {
        type: [String],
        required: [true, 'Please provide at least one category'],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Please provide at least one category',
        },
    },
    image: {
        type: String,
        default: 'default.jpg',
    },
    video: String,
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide an author'],
    },
    likes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    comments: [
        {
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            text: {
                type: String,
                required: [true, 'Please provide comment text'],
                trim: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Create text index for search
RecipeSchema.index({ title: 'text', description: 'text', ingredients: 'text' });
// Add methods to the schema
RecipeSchema.methods.updateViews = async function () {
    this.views += 1;
    await this.save();
};
RecipeSchema.methods.addLike = async function (userId) {
    const userIdStr = userId.toString();
    const hasLiked = this.likes.some((id) => id.toString() === userIdStr);
    if (!hasLiked) {
        this.likes.push(userId);
        await this.save();
    }
    return this;
};
RecipeSchema.methods.removeLike = async function (userId) {
    const userIdStr = userId.toString();
    this.likes = this.likes.filter((id) => id.toString() !== userIdStr);
    await this.save();
    return this;
};
RecipeSchema.methods.addComment = async function (comment) {
    this.comments.push({
        user: comment.user,
        text: comment.text,
        createdAt: new Date()
    });
    await this.save();
    return this;
};
// Create and export the model
const Recipe = (0, mongoose_1.model)('Recipe', RecipeSchema);
exports.Recipe = Recipe;
