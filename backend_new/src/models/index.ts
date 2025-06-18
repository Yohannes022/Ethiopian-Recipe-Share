// Core Data Models
import './user.model';
import './profile.model';
import './recipe.model';
import './restaurant.model';
import './menuItem.model';
import './order.model';
import './category.model';
import './review.model';
import './notification.model';
import './favorite.model';

// Note: This file imports all core data models that are stored in MongoDB.
// The following features are implemented through controllers and routes:
// - Search: Uses MongoDB text search across existing models
// - Analytics: Aggregates data from existing models
// - Media Upload: Uses multer for file handling with existing models
// - No separate models needed for these features as they operate on the core data models

// Make sure to import this file in your main application file (index.ts)
// by adding: import '@/models'; at the top of index.ts
