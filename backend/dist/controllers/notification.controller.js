"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUnreadNotificationsCount = exports.getAllNotifications = void 0;
const Notification_1 = __importDefault(require("@/models/Notification"));
const apiError_1 = require("@/utils/apiError");
// Get all notifications with filters
const getAllNotifications = async (req, res, next) => {
    try {
        // Extract query parameters
        const { type, read, sort, page = 1, limit = 10, } = req.query;
        // Build query
        const query = { user: req.user._id };
        if (type)
            query.type = type;
        if (read !== undefined)
            query.read = read === 'true';
        // Build sort
        const sortOptions = {};
        if (sort === 'type')
            sortOptions.type = 1;
        else if (sort === '-type')
            sortOptions.type = -1;
        else
            sortOptions.createdAt = -1;
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get total count
        const total = await Notification_1.default.countDocuments(query);
        // Get notifications
        const notifications = await Notification_1.default.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .populate('user', 'name photo')
            .populate('related', '_id name image');
        res.status(200).json({
            status: 'success',
            results: notifications.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: notifications,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllNotifications = getAllNotifications;
// Get unread notifications count
const getUnreadNotificationsCount = async (req, res, next) => {
    try {
        const count = await Notification_1.default.countDocuments({
            user: req.user._id,
            read: false,
        });
        res.status(200).json({
            status: 'success',
            data: { count },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUnreadNotificationsCount = getUnreadNotificationsCount;
// Mark notification as read
const markNotificationAsRead = async (req, res, next) => {
    try {
        const notification = await Notification_1.default.findById(req.params.id);
        if (!notification) {
            throw new apiError_1.NotFoundError('Notification not found');
        }
        // Check if notification belongs to user
        if (!notification.user.equals(req.user._id)) {
            throw new apiError_1.BadRequestError('You do not have permission to mark this notification as read');
        }
        notification.markAsRead();
        await notification.save();
        res.status(200).json({
            status: 'success',
            data: notification,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        await Notification_1.default.updateMany({ user: req.user._id, read: false }, { read: true });
        res.status(200).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
// Delete notification
const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification_1.default.findById(req.params.id);
        if (!notification) {
            throw new apiError_1.NotFoundError('Notification not found');
        }
        // Check if notification belongs to user
        if (!notification.user.equals(req.user._id)) {
            throw new apiError_1.BadRequestError('You do not have permission to delete this notification');
        }
        await Notification_1.default.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNotification = deleteNotification;
// Create notification (utility function)
const createNotification = async (user, type, message, relatedId, relatedType, io) => {
    try {
        const notification = await Notification_1.default.create({
            user,
            type,
            message,
            relatedId,
            relatedType,
        });
        // Emit socket event for real-time updates
        io.to(`user_${user}`).emit('newNotification', {
            notification,
            unreadCount: await Notification_1.default.countDocuments({
                user,
                read: false,
            }),
        });
        return notification;
    }
    catch (error) {
        throw error;
    }
};
exports.createNotification = createNotification;
