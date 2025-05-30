"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recipe = void 0;
const mongoose_1 = require("mongoose");
const RecipeSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    ingredients: [{
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: String,
                required: true
            },
            unit: {
                type: String,
                required: true
            }
        }],
    instructions: [{
            type: String,
            required: true
        }],
    preparationTime: {
        type: Number,
        required: true
    },
    cookingTime: {
        type: Number,
        required: true
    },
    servings: {
        type: Number,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    cuisine: {
        type: String,
        required: true
    },
    category: [{
            type: String,
            required: true
        }],
    imageUrl: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: false
    },
    author: {
        id: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true
        }
    },
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }]
}, {
    timestamps: true
});
RecipeSchema.index({ title: 'text', description: 'text', ingredients: 'text' });
exports.Recipe = (0, mongoose_1.model)('Recipe', RecipeSchema);
