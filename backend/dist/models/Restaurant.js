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
// Define the schema
const restaurantSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Restaurant must have a name'],
        trim: true,
        minlength: [3, 'Restaurant name must be at least 3 characters'],
        maxlength: [100, 'Restaurant name must not exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Restaurant must have a description'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [500, 'Description must not exceed 500 characters'],
    },
    cuisine: {
        type: [String],
        required: [true, 'Restaurant must have cuisine types'],
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Restaurant must belong to a category'],
    },
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Restaurant must have an owner'],
    },
    location: {
        address: {
            type: String,
            required: [true, 'Restaurant must have an address'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'Restaurant must have a city'],
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            required: [true, 'Restaurant must have a country'],
            trim: true,
        },
        zipCode: {
            type: String,
            required: [true, 'Restaurant must have a zip code'],
            trim: true,
        },
        coordinates: {
            type: [Number],
            required: [true, 'Restaurant must have coordinates'],
        },
    },
    openingHours: [{
            days: {
                type: [String],
                required: [true, 'Opening hours must have days'],
                validate: {
                    validator: function (v) {
                        return v.length > 0;
                    },
                    message: 'Opening hours must have at least one day',
                },
            },
            opens: {
                type: String,
                required: [true, 'Opening hours must have opening time'],
                validate: {
                    validator: function (v) {
                        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                    },
                    message: 'Opening time must be in 24-hour format (HH:mm)',
                },
            },
            closes: {
                type: String,
                required: [true, 'Opening hours must have closing time'],
                validate: {
                    validator: function (v) {
                        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                    },
                    message: 'Closing time must be in 24-hour format (HH:mm)',
                },
            },
        }],
    phone: {
        type: String,
        required: [true, 'Restaurant must have a phone number'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Restaurant must have an email'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: 'Please provide a valid email address',
        },
    },
    website: {
        type: String,
        trim: true,
    },
    socialMedia: {
        facebook: {
            type: String,
            trim: true,
        },
        twitter: {
            type: String,
            trim: true,
        },
        instagram: {
            type: String,
            trim: true,
        },
    },
    reviews: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Review',
            default: [],
        }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    menu: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'MenuItem',
        }],
    images: [{
            type: String,
            trim: true,
        }],
    videos: [{
            type: String,
            trim: true,
        }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Add methods to the schema
restaurantSchema.methods.calculateRating = async function () {
    if (this.reviews.length === 0) {
        this.rating = 0;
        return;
    }
    // Populate the reviews to get the actual review documents
    const populatedReviews = await this.populate('reviews');
    const reviews = populatedReviews.reviews;
    const totalRating = reviews.reduce((sum, review) => {
        return sum + (review.get('rating') || 0);
    }, 0);
    this.rating = totalRating / reviews.length;
};
restaurantSchema.methods.addMenuItem = async function (menuItemId) {
    this.menu.push(menuItemId);
    await this.save();
};
restaurantSchema.methods.removeMenuItem = async function (menuItemId) {
    this.menu = this.menu.filter((item) => item.toString() !== menuItemId.toString());
    await this.save();
};
restaurantSchema.methods.addOpeningHours = async function (days, opens, closes) {
    this.openingHours.push({ days, opens, closes });
    await this.save();
};
restaurantSchema.methods.removeOpeningHours = async function (hours) {
    this.openingHours = this.openingHours.filter((hour) => hour.days.toString() !== hours.toString());
    await this.save();
};
// Create and export the model
const Restaurant = mongoose_1.default.model('Restaurant', restaurantSchema);
exports.default = Restaurant;
