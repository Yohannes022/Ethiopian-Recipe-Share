"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const test_routes_1 = __importDefault(require("./test.routes"));
const user_controller_1 = require("../controllers/user.controller");
const recipe_controller_1 = require("../controllers/recipe.controller");
const restaurant_controller_1 = require("../controllers/restaurant.controller");
const menuItem_controller_1 = require("../controllers/menuItem.controller");
const order_controller_1 = require("../controllers/order.controller");
const review_controller_1 = require("../controllers/review.controller");
const category_controller_1 = require("../controllers/category.controller");
const search_controller_1 = require("../controllers/search.controller");
const upload_controller_1 = require("../controllers/upload.controller");
const notification_controller_1 = require("../controllers/notification.controller");
const favorite_controller_1 = require("../controllers/favorite.controller");
const router = express_1.default.Router();
// Auth routes
router.post('/auth/signup', auth_controller_1.signup);
router.post('/auth/login', auth_controller_1.login);
router.post('/auth/logout', auth_controller_1.protect, auth_controller_1.logout);
router.post('/auth/forgot-password', auth_controller_1.forgotPassword);
router.patch('/auth/reset-password/:token', auth_controller_1.resetPassword);
router.patch('/auth/update-password', auth_controller_1.protect, auth_controller_1.updatePassword);
router.get('/auth/verify-email/:token', auth_controller_1.verifyEmail);
router.post('/auth/resend-verification-email', auth_controller_1.protect, auth_controller_1.resendVerificationEmail);
// Notification routes
router.get('/notifications', auth_controller_1.protect, notification_controller_1.getAllNotifications);
router.put('/notifications/:id/read', auth_controller_1.protect, notification_controller_1.markNotificationAsRead);
router.delete('/notifications/:id', auth_controller_1.protect, notification_controller_1.deleteNotification);
router.get('/notifications/unread-count', auth_controller_1.protect, notification_controller_1.getUnreadNotificationsCount);
router.put('/notifications/read-all', auth_controller_1.protect, notification_controller_1.markAllNotificationsAsRead);
// Favorite routes
router.post('/favorites', auth_controller_1.protect, favorite_controller_1.createFavorite);
router.delete('/favorites/:id', auth_controller_1.protect, favorite_controller_1.deleteFavorite);
router.get('/favorites', auth_controller_1.protect, favorite_controller_1.getAllFavoritesByUser);
router.get('/favorites/:type', auth_controller_1.protect, favorite_controller_1.getFavoritesByTypeByUser);
// User routes
router.get('/users/me', auth_controller_1.protect, user_controller_1.getMe);
router.patch('/users/me', auth_controller_1.protect, user_controller_1.updateMe);
router.delete('/users/me', auth_controller_1.protect, user_controller_1.deleteMe);
router.get('/users', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('admin'), user_controller_1.getAllUsers);
router.get('/users/:id', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('admin'), user_controller_1.getUser);
router.patch('/users/:id', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('admin'), user_controller_1.updateUser);
router.delete('/users/:id', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('admin'), user_controller_1.deleteUser);
// Recipe routes
router.get('/recipes', recipe_controller_1.getAllRecipes);
router.post('/recipes', auth_controller_1.protect, recipe_controller_1.createRecipe);
router.get('/recipes/:id', recipe_controller_1.getRecipe);
router.patch('/recipes/:id', auth_controller_1.protect, recipe_controller_1.updateRecipe);
router.delete('/recipes/:id', auth_controller_1.protect, recipe_controller_1.deleteRecipe);
router.get('/recipes/user/:userId', recipe_controller_1.getRecipesByUser);
router.post('/recipes/:id/like', auth_controller_1.protect, recipe_controller_1.likeRecipe);
router.post('/recipes/:id/comment', auth_controller_1.protect, recipe_controller_1.commentOnRecipe);
// Restaurant routes
router.get('/restaurants', restaurant_controller_1.getAllRestaurants);
router.post('/restaurants', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('restaurant_owner', 'admin'), restaurant_controller_1.createRestaurant);
router.get('/restaurants/:id', restaurant_controller_1.getRestaurant);
router.patch('/restaurants/:id', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('restaurant_owner', 'admin'), restaurant_controller_1.updateRestaurant);
router.delete('/restaurants/:id', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('restaurant_owner', 'admin'), restaurant_controller_1.deleteRestaurant);
router.get('/restaurants/owner/:ownerId', auth_controller_1.protect, restaurant_controller_1.getRestaurantsByOwner);
router.get('/restaurants/:id/menu', restaurant_controller_1.getRestaurantMenu);
// Menu Item routes
router.get('/menu-items', menuItem_controller_1.getAllMenuItems);
router.post('/menu-items', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('restaurant_owner'), menuItem_controller_1.createMenuItem);
router.get('/menu-items/:id', menuItem_controller_1.getMenuItem);
router.patch('/menu-items/:id', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('restaurant_owner'), menuItem_controller_1.updateMenuItem);
router.delete('/menu-items/:id', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('restaurant_owner'), menuItem_controller_1.deleteMenuItem);
router.get('/restaurants/:restaurantId/menu-items', menuItem_controller_1.getMenuItemsByRestaurant);
// Order routes
router.get('/orders', auth_controller_1.protect, order_controller_1.getAllOrders);
router.post('/orders', auth_controller_1.protect, order_controller_1.createOrder);
router.get('/orders/:id', auth_controller_1.protect, order_controller_1.getOrder);
router.patch('/orders/:id/status', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('restaurant_owner', 'admin'), order_controller_1.updateOrderStatus);
router.get('/orders/restaurant/:restaurantId', auth_controller_1.protect, order_controller_1.getOrdersByRestaurant);
router.get('/orders/user/:userId', auth_controller_1.protect, order_controller_1.getOrdersByUser);
// Review routes
router.get('/reviews', review_controller_1.getAllReviews);
router.post('/reviews', auth_controller_1.protect, review_controller_1.createReview);
router.get('/reviews/:id', review_controller_1.getReview);
router.patch('/reviews/:id', auth_controller_1.protect, review_controller_1.updateReview);
router.delete('/reviews/:id', auth_controller_1.protect, review_controller_1.deleteReview);
router.get('/restaurants/:restaurantId/reviews', review_controller_1.getReviewsByRestaurant);
router.get('/users/:userId/reviews', review_controller_1.getReviewsByUser);
// Category routes
router.get('/categories', category_controller_1.getAllCategories);
router.post('/categories', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('admin'), category_controller_1.createCategory);
router.get('/categories/:id', category_controller_1.getCategory);
router.patch('/categories/:id', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('admin'), category_controller_1.updateCategory);
router.delete('/categories/:id', auth_controller_1.protect, (0, auth_controller_1.restrictTo)('admin'), category_controller_1.deleteCategory);
// Search route
router.get('/search', search_controller_1.search);
// Test routes (only in development)
if (process.env.NODE_ENV === 'development') {
    router.use('/test', test_routes_1.default);
}
// Upload routes
router.post('/upload/image', auth_controller_1.protect, upload_controller_1.uploadImage);
router.delete('/upload/:filename', auth_controller_1.protect, upload_controller_1.deleteImage);
// Notification routes
router.get('/notifications', auth_controller_1.protect, notification_controller_1.getAllNotifications);
router.patch('/notifications/:id/read', auth_controller_1.protect, notification_controller_1.markNotificationAsRead);
// Favorite routes
router.post('/favorites', auth_controller_1.protect, favorite_controller_1.createFavorite);
router.delete('/favorites/:id', auth_controller_1.protect, favorite_controller_1.deleteFavorite);
router.get('/favorites', auth_controller_1.protect, favorite_controller_1.getAllFavoritesByUser);
router.get('/favorites/:type', auth_controller_1.protect, favorite_controller_1.getFavoritesByTypeByUser);
exports.default = router;
