"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
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
categorySchema.methods.updateIcon = function (newIcon) {
    this.icon = newIcon;
};
categorySchema.methods.updateImage = function (newImage) {
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
const Category = mongoose_1.default.model('Category', categorySchema);
exports.default = Category;
