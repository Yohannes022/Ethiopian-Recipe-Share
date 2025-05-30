"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Notification must belong to a user'],
    },
    type: {
        type: String,
        required: [true, 'Notification must have a type'],
        enum: ['like', 'comment', 'follow', 'review', 'order', 'message'],
    },
    message: {
        type: String,
        required: [true, 'Notification must have a message'],
        trim: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    relatedId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: [true, 'Notification must have a related ID'],
    },
    relatedType: {
        type: String,
        required: [true, 'Notification must have a related type'],
        enum: ['recipe', 'restaurant', 'review', 'user', 'order'],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ relatedId: 1, relatedType: 1 });
// Virtual populate
notificationSchema.virtual('user', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true,
    select: 'name photo',
});
notificationSchema.virtual('related', {
    refPath: 'relatedType',
    localField: 'relatedId',
    foreignField: '_id',
    justOne: true,
    select: '_id name image',
});
// Instance methods
notificationSchema.methods.markAsRead = function () {
    this.read = true;
};
notificationSchema.methods.markAsUnread = function () {
    this.read = false;
};
// Create and export the model
const Notification = mongoose_1.default.model('Notification', notificationSchema);
exports.default = Notification;
