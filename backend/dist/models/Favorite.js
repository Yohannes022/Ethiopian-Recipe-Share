"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const favoriteSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Favorite must belong to a user'],
    },
    type: {
        type: String,
        required: [true, 'Favorite must have a type'],
        enum: ['recipe', 'restaurant', 'menu'],
    },
    itemId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: [true, 'Favorite must have an item ID'],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes
favoriteSchema.index({ user: 1, type: 1, itemId: 1 }, { unique: true });
// Virtual populate
favoriteSchema.virtual('userDetails', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true,
    select: 'name photo',
});
favoriteSchema.virtual('item', {
    ref: (doc) => {
        if (!doc.type)
            return null;
        return doc.type === 'recipe' ? 'Recipe' : doc.type === 'restaurant' ? 'Restaurant' : 'Menu';
    },
    localField: 'itemId',
    foreignField: '_id',
    justOne: true,
    select: '_id name image',
});
// Instance methods
favoriteSchema.methods.updateType = function (newType) {
    this.type = newType;
};
// Create and export the model
const Favorite = mongoose_1.default.model('Favorite', favoriteSchema);
exports.default = Favorite;
