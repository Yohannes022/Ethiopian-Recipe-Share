"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const menuItemSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Menu item must have a name'],
        trim: true,
        maxlength: [100, 'Menu item name must be less than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Menu item must have a description'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Menu item must have a price'],
        min: [0, 'Price cannot be negative'],
    },
    category: {
        type: String,
        required: [true, 'Menu item must have a category'],
        trim: true,
        enum: ['appetizer', 'main', 'dessert', 'beverage', 'special'],
    },
    image: {
        type: String,
        required: [true, 'Menu item must have an image'],
        trim: true,
    },
    restaurant: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'Menu item must belong to a restaurant'],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ restaurant: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ price: 1 });
// Instance methods
menuItemSchema.methods.updatePrice = function (newPrice) {
    this.price = newPrice;
};
// Create and export the model
const MenuItem = mongoose_1.default.model('MenuItem', menuItemSchema);
exports.default = MenuItem;
