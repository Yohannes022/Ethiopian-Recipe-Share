"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ingredientSchema = new mongoose_1.Schema({
    name: { type: String, required: [true, 'An ingredient must have a name'] },
    quantity: { type: Number, required: [true, 'Please provide quantity'] },
    unit: { type: String, required: [true, 'Please provide unit'] },
    notes: String
});
const instructionSchema = new mongoose_1.Schema({
    step: { type: Number, required: true },
    description: { type: String, required: [true, 'Please provide instruction description'] },
    duration: Number
});
const recipeSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'A recipe must have a title'],
        trim: true,
        maxlength: [100, 'A recipe title must have less or equal than 100 characters'],
        minlength: [5, 'A recipe title must have more or equal than 5 characters']
    },
    description: {
        type: String,
        required: [true, 'A recipe must have a description'],
        trim: true
    },
    ingredients: [ingredientSchema],
    instructions: [instructionSchema],
    prepTime: {
        type: Number,
        required: [true, 'Please provide preparation time']
    },
    cookTime: {
        type: Number,
        required: [true, 'Please provide cooking time']
    },
    servings: {
        type: Number,
        required: [true, 'Please provide number of servings']
    },
    difficulty: {
        type: String,
        required: [true, 'Please provide difficulty level'],
        enum: {
            values: ['easy', 'medium', 'hard'],
            message: 'Difficulty is either: easy, medium, or hard'
        }
    },
    cuisine: {
        type: String,
        required: [true, 'Please provide cuisine type']
    },
    mealType: {
        type: [String],
        required: [true, 'Please provide at least one meal type']
    },
    dietaryRestrictions: [String],
    image: String,
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A recipe must belong to a user']
    },
    likes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    comments: [
        {
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    averageRating: {
        type: Number,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratings: [
        {
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            }
        }
    ],
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
recipeSchema.index({ title: 'text', description: 'text' });
recipeSchema.index({ user: 1 });
recipeSchema.index({ averageRating: -1 });
recipeSchema.virtual('totalTime').get(function () {
    return this.prepTime + this.cookTime;
});
recipeSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'recipe',
    localField: '_id'
});
recipeSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    next();
});
recipeSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r._id);
});
recipeSchema.statics.calcAverageRatings = async function (recipeId) {
    const stats = await this.aggregate([
        {
            $match: { _id: new mongoose_1.default.Types.ObjectId(recipeId) }
        },
        {
            $unwind: '$ratings'
        },
        {
            $group: {
                _id: '$_id',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$ratings.rating' }
            }
        }
    ]);
    if (stats.length > 0) {
        await this.findByIdAndUpdate(recipeId, {
            averageRating: Math.ceil(stats[0].avgRating * 10) / 10
        });
    }
    else {
        await this.findByIdAndUpdate(recipeId, {
            averageRating: undefined
        });
    }
};
recipeSchema.post('save', function () {
    this.constructor.calcAverageRatings(this._id);
});
const Recipe = mongoose_1.default.model('Recipe', recipeSchema);
exports.default = Recipe;
//# sourceMappingURL=recipe.model.js.map