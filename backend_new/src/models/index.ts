// Import all models
import './user.model';
import './profile.model';
import './recipe.model';
import './restaurant.model';
import './menuItem.model';

// This file ensures all models are registered with Mongoose when imported
// The models are registered when they are imported, so we just need to import them here
// and then import this file in the main application entry point (index.ts)

// Note: Make sure to import this file in your main application file (index.ts)
// by adding: import '@/models'; at the top of index.ts
