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
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    image: String,
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true }
});
const restaurantSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true, default: 'Ethiopia' },
        coordinates: { type: [Number], index: '2dsphere' }
    },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    website: String,
    cuisineType: [{ type: String, required: true }],
    openingHours: {
        monday: {
            open: { type: Boolean, default: true },
            hours: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '21:00' }
            }
        },
        tuesday: {
            open: { type: Boolean, default: true },
            hours: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '21:00' }
            }
        },
        wednesday: {
            open: { type: Boolean, default: true },
            hours: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '21:00' }
            }
        },
        thursday: {
            open: { type: Boolean, default: true },
            hours: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '21:00' }
            }
        },
        friday: {
            open: { type: Boolean, default: true },
            hours: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '22:00' }
            }
        },
        saturday: {
            open: { type: Boolean, default: true },
            hours: {
                open: { type: String, default: '10:00' },
                close: { type: String, default: '22:00' }
            }
        },
        sunday: {
            open: { type: Boolean, default: true },
            hours: {
                open: { type: String, default: '10:00' },
                close: { type: String, default: '21:00' }
            }
        }
    },
    menu: [menuItemSchema],
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    deliveryOptions: {
        delivery: { type: Boolean, default: true },
        pickup: { type: Boolean, default: true },
        minimumOrder: { type: Number, default: 0 },
        deliveryFee: { type: Number, default: 0 },
        freeDeliveryOver: { type: Number, default: 0 }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
restaurantSchema.index({ name: 'text', description: 'text' });
restaurantSchema.index({ 'address.city': 1 });
restaurantSchema.index({ 'address.coordinates': '2dsphere' });
restaurantSchema.index({ cuisineType: 1 });
restaurantSchema.index({ owner: 1 });
restaurantSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'restaurant'
});
const Restaurant = mongoose_1.default.model('Restaurant', restaurantSchema);
exports.default = Restaurant;
//# sourceMappingURL=restaurant.model.js.map