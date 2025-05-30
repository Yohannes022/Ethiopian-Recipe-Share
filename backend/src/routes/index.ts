import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { signup, login, logout, protect as protectRoute, restrictTo as restrictToRole, resetPassword, forgotPassword, updatePassword, verifyEmail, resendVerificationEmail } from '../controllers/auth.controller';
import testRoutes from './test.routes';
import { getAllUsers, getUser, updateUser, deleteUser, getMe, updateMe, deleteMe } from '../controllers/user.controller';
import { getAllRecipes, createRecipe, getRecipe, updateRecipe, deleteRecipe, getRecipesByUser, likeRecipe, commentOnRecipe } from '../controllers/recipe.controller';
import { getAllRestaurants, createRestaurant, getRestaurant, updateRestaurant, deleteRestaurant, getRestaurantsByOwner, getRestaurantMenu } from '../controllers/restaurant.controller';
import { getAllMenuItems, createMenuItem, getMenuItem, updateMenuItem, deleteMenuItem, getMenuItemsByRestaurant } from '../controllers/menuItem.controller';
import { getAllOrders, createOrder, getOrder, updateOrderStatus, getOrdersByRestaurant, getOrdersByUser } from '../controllers/order.controller';
import { getAllReviews, createReview, getReview, updateReview, deleteReview, getReviewsByRestaurant, getReviewsByUser } from '../controllers/review.controller';
import { getAllCategories, createCategory, getCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { search } from '../controllers/search.controller';
import { uploadImage, deleteImage } from '../controllers/upload.controller';
import { getAllNotifications, markNotificationAsRead, deleteNotification, getUnreadNotificationsCount, markAllNotificationsAsRead } from '../controllers/notification.controller';
import { getAllFavoritesByUser, createFavorite, deleteFavorite, getFavoritesByTypeByUser } from '../controllers/favorite.controller';

const router = express.Router();
    
// Auth routes
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/logout', protectRoute, logout);
router.post('/auth/forgot-password', forgotPassword);
router.patch('/auth/reset-password/:token', resetPassword);
router.patch('/auth/update-password', protectRoute, updatePassword);
router.get('/auth/verify-email/:token', verifyEmail);
router.post('/auth/resend-verification-email', protectRoute, resendVerificationEmail);

// Notification routes
router.get('/notifications', protectRoute, getAllNotifications);
router.put('/notifications/:id/read', protectRoute, markNotificationAsRead);
router.delete('/notifications/:id', protectRoute, deleteNotification);
router.get('/notifications/unread-count', protectRoute, getUnreadNotificationsCount);
router.put('/notifications/read-all', protectRoute, markAllNotificationsAsRead);

// Favorite routes
router.post('/favorites', protectRoute, createFavorite);
router.delete('/favorites/:id', protectRoute, deleteFavorite);
router.get('/favorites', protectRoute, getAllFavoritesByUser);
router.get('/favorites/:type', protectRoute, getFavoritesByTypeByUser);

// User routes
router.get('/users/me', protectRoute, getMe);
router.patch('/users/me', protectRoute, updateMe);
router.delete('/users/me', protectRoute, deleteMe);
router.get('/users', protectRoute, restrictToRole('admin'), getAllUsers);
router.get('/users/:id', protectRoute, restrictToRole('admin'), getUser);
router.patch('/users/:id', protectRoute, restrictToRole('admin'), updateUser);
router.delete('/users/:id', protectRoute, restrictToRole('admin'), deleteUser);

// Recipe routes
router.get('/recipes', getAllRecipes);
router.post('/recipes', protectRoute, createRecipe);
router.get('/recipes/:id', getRecipe);
router.patch('/recipes/:id', protectRoute, updateRecipe);
router.delete('/recipes/:id', protectRoute, deleteRecipe);
router.get('/recipes/user/:userId', getRecipesByUser);
router.post('/recipes/:id/like', protectRoute, likeRecipe);
router.post('/recipes/:id/comment', protectRoute, commentOnRecipe);

// Restaurant routes
router.get('/restaurants', getAllRestaurants);
router.post('/restaurants', protectRoute, restrictToRole('restaurant_owner', 'admin'), createRestaurant);
router.get('/restaurants/:id', getRestaurant);
router.patch('/restaurants/:id', protectRoute, restrictToRole('restaurant_owner', 'admin'), updateRestaurant);
router.delete('/restaurants/:id', protectRoute, restrictToRole('restaurant_owner', 'admin'), deleteRestaurant);
router.get('/restaurants/owner/:ownerId', protectRoute, getRestaurantsByOwner);
router.get('/restaurants/:id/menu', getRestaurantMenu);

// Menu Item routes
router.get('/menu-items', getAllMenuItems);
router.post('/menu-items', protectRoute, restrictToRole('restaurant_owner'), createMenuItem);
router.get('/menu-items/:id', getMenuItem);
router.patch('/menu-items/:id', protectRoute, restrictToRole('restaurant_owner'), updateMenuItem);
router.delete('/menu-items/:id', protectRoute, restrictToRole('restaurant_owner'), deleteMenuItem);
router.get('/restaurants/:restaurantId/menu-items', getMenuItemsByRestaurant);

// Order routes
router.get('/orders', protectRoute, getAllOrders);
router.post('/orders', protectRoute, createOrder);
router.get('/orders/:id', protectRoute, getOrder);
router.patch('/orders/:id/status', protectRoute, restrictToRole('restaurant_owner', 'admin'), updateOrderStatus);
router.get('/orders/restaurant/:restaurantId', protectRoute, getOrdersByRestaurant);
router.get('/orders/user/:userId', protectRoute, getOrdersByUser);

// Review routes
router.get('/reviews', getAllReviews);
router.post('/reviews', protectRoute, createReview);
router.get('/reviews/:id', getReview);
router.patch('/reviews/:id', protectRoute, updateReview);
router.delete('/reviews/:id', protectRoute, deleteReview);
router.get('/restaurants/:restaurantId/reviews', getReviewsByRestaurant);
router.get('/users/:userId/reviews', getReviewsByUser);

// Category routes
router.get('/categories', getAllCategories);
router.post('/categories', protectRoute, restrictToRole('admin'), createCategory);
router.get('/categories/:id', getCategory);
router.patch('/categories/:id', protectRoute, restrictToRole('admin'), updateCategory);
router.delete('/categories/:id', protectRoute, restrictToRole('admin'), deleteCategory);

// Search route
router.get('/search', search);

// Test routes (only in development)
if (process.env.NODE_ENV === 'development') {
  router.use('/test', testRoutes);
}

// Upload routes
router.post('/upload/image', protectRoute, uploadImage);
router.delete('/upload/:filename', protectRoute, deleteImage);

// Notification routes
router.get('/notifications', protectRoute, getAllNotifications);
router.patch('/notifications/:id/read', protectRoute, markNotificationAsRead);

// Favorite routes
router.post('/favorites', protectRoute, createFavorite);
router.delete('/favorites/:id', protectRoute, deleteFavorite);
router.get('/favorites', protectRoute, getAllFavoritesByUser);
router.get('/favorites/:type', protectRoute, getFavoritesByTypeByUser);

export default router;
