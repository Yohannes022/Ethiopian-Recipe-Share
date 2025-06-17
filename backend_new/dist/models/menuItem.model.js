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
const menuItemSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'A menu item must have a name'],
        trim: true,
        maxlength: [100, 'A menu item name must have less or equal than 100 characters'],
        minlength: [3, 'A menu item name must have more or equal than 3 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'A menu item must have a price'],
        min: [0, 'Price must be a positive number']
    },
    image: {
        type: String,
        default: 'default-menu-item.jpg'
    },
    category: {
        type: String,
        required: [true, 'Please specify the category of the menu item'],
        enum: {
            values: ['appetizer', 'main', 'dessert', 'beverage', 'side'],
            message: 'Category is either: appetizer, main, dessert, beverage, or side'
        }
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    isVegan: {
        type: Boolean,
        default: false
    },
    isGlutenFree: {
        type: Boolean,
        default: false
    },
    isSpicy: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    restaurant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'A menu item must belong to a restaurant']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
menuItemSchema.index({ name: 1, restaurant: 1 }, { unique: true });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ isVegetarian: 1 });
menuItemSchema.index({ isVegan: 1 });
menuItemSchema.index({ isGlutenFree: 1 });
menuItemSchema.index({ isSpicy: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ category: 1 });
const MenuItem = mongoose_1.default.model('MenuItem', menuItemSchema);
exports.default = MenuItem;
//# sourceMappingURL=menuItem.model.js.map