import { Types } from 'mongoose';
import { Recipe } from '../models/Recipe';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';

class SearchService {
  /**
   * Search across all models
   */
  static async globalSearch(query: string, userId?: string) {
    try {
      const searchQuery = {
        $text: { $search: query },
        $or: [
          { isPublic: true },
          ...(userId ? [{ createdBy: new Types.ObjectId(userId) }] : []),
        ],
      };

      const [recipes, restaurants, menuItems, users] = await Promise.all([
        // Search recipes
        Recipe.find({
          ...searchQuery,
          status: 'published',
        })
          .select('title description imageUrl slug')
          .limit(5)
          .lean(),

        // Search restaurants
        Restaurant.find({
          ...searchQuery,
          isActive: true,
        })
          .select('name description logoUrl slug')
          .limit(5)
          .lean(),

        // Search menu items
        MenuItem.find({
          ...searchQuery,
          isAvailable: true,
        })
          .select('name description imageUrl slug restaurant')
          .populate('restaurant', 'name slug')
          .limit(5)
          .lean(),

        // Search users (only if authenticated)
        userId
          ? User.find({
              $text: { $search: query },
              _id: { $ne: new Types.ObjectId(userId) },
              isActive: true,
            })
              .select('name username avatarUrl')
              .limit(5)
              .lean()
          : Promise.resolve([]),
      ]);

      return {
        recipes,
        restaurants,
        menuItems,
        users,
      };
    } catch (error) {
      console.error('Error in global search:', error);
      throw new ApiError(500, 'Error performing search');
    }
  }

  /**
   * Search recipes with advanced filters
   */
  static async searchRecipes(
    query: string,
    filters: {
      cuisine?: string[];
      dietaryPreferences?: string[];
      difficulty?: string[];
      cookTime?: { min?: number; max?: number };
      rating?: number;
      ingredients?: string[];
      tags?: string[];
      userId?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const searchQuery: any = {
        status: 'published',
        $or: [
          { isPublic: true },
          ...(filters.userId
            ? [{ createdBy: new Types.ObjectId(filters.userId) }]
            : []),
        ],
      };

      // Text search
      if (query) {
        searchQuery.$text = { $search: query };
      }

      // Apply filters
      if (filters.cuisine?.length) {
        searchQuery.cuisine = { $in: filters.cuisine };
      }

      if (filters.dietaryPreferences?.length) {
        searchQuery.dietaryPreferences = {
          $in: filters.dietaryPreferences,
        };
      }

      if (filters.difficulty?.length) {
        searchQuery.difficulty = { $in: filters.difficulty };
      }

      if (filters.cookTime) {
        searchQuery['cookTime.total'] = {};
        if (filters.cookTime.min) {
          searchQuery['cookTime.total'].$gte = filters.cookTime.min;
        }
        if (filters.cookTime.max) {
          searchQuery['cookTime.total'].$lte = filters.cookTime.max;
        }
      }

      if (filters.rating) {
        searchQuery.ratingAverage = { $gte: filters.rating };
      }

      if (filters.ingredients?.length) {
        searchQuery['ingredients.name'] = { $in: filters.ingredients };
      }

      if (filters.tags?.length) {
        searchQuery.tags = { $in: filters.tags };
      }

      const [recipes, total] = await Promise.all([
        Recipe.find(searchQuery)
          .select('-__v -updatedAt -createdAt')
          .populate('createdBy', 'name username avatarUrl')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Recipe.countDocuments(searchQuery),
      ]);

      return {
        data: recipes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw new ApiError(500, 'Error searching recipes');
    }
  }

  /**
   * Search restaurants with filters
   */
  static async searchRestaurants(
    query: string,
    filters: {
      cuisines?: string[];
      priceRange?: string[];
      rating?: number;
      hasDelivery?: boolean;
      hasTakeout?: boolean;
      isOpenNow?: boolean;
      location?: {
        lat: number;
        lng: number;
        radius?: number; // in kilometers
      };
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const searchQuery: any = {
        isActive: true,
      };

      // Text search
      if (query) {
        searchQuery.$text = { $search: query };
      }

      // Apply filters
      if (filters.cuisines?.length) {
        searchQuery.cuisine = { $in: filters.cuisines };
      }

      if (filters.priceRange?.length) {
        searchQuery.priceRange = { $in: filters.priceRange };
      }

      if (filters.rating) {
        searchQuery.ratingAverage = { $gte: filters.rating };
      }

      if (filters.hasDelivery !== undefined) {
        searchQuery.hasDelivery = filters.hasDelivery;
      }

      if (filters.hasTakeout !== undefined) {
        searchQuery.hasTakeout = filters.hasTakeout;
      }

      // Location-based search
      if (filters.location) {
        const { lat, lng, radius = 10 } = filters.location;
        const radiusInMeters = radius * 1000; // Convert km to meters

        searchQuery['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat], // GeoJSON uses [longitude, latitude]
            },
            $maxDistance: radiusInMeters,
          },
        };
      }

      // Open now filter
      if (filters.isOpenNow) {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
        const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert to HHMM format

        searchQuery['openingHours'] = {
          $elemMatch: {
            dayOfWeek,
            open: { $lte: currentTime },
            close: { $gte: currentTime },
            isOpen: true,
          },
        };
      }

      const [restaurants, total] = await Promise.all([
        Restaurant.find(searchQuery)
          .select('-__v -updatedAt -createdAt')
          .sort({ ratingAverage: -1, name: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Restaurant.countDocuments(searchQuery),
      ]);

      return {
        data: restaurants,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error searching restaurants:', error);
      throw new ApiError(500, 'Error searching restaurants');
    }
  }

  /**
   * Get search suggestions
   */
  static async getSearchSuggestions(query: string, type?: 'recipe' | 'restaurant' | 'user') {
    try {
      if (!query) return [];

      const searchQuery = {
        $text: { $search: query },
        ...(type === 'recipe' && { status: 'published' }),
        ...(type === 'restaurant' && { isActive: true }),
        ...(type === 'user' && { isActive: true }),
      };

      let results: any[] = [];

      switch (type) {
        case 'recipe':
          results = await Recipe.find(searchQuery)
            .select('title slug')
            .limit(5)
            .lean();
          break;

        case 'restaurant':
          results = await Restaurant.find(searchQuery)
            .select('name slug')
            .limit(5)
            .lean();
          break;

        case 'user':
          results = await User.find(searchQuery)
            .select('username name')
            .limit(5)
            .lean();
          break;

        default:
          // Search across all types
          const [recipeResults, restaurantResults, userResults] = await Promise.all([
            Recipe.find({ ...searchQuery, status: 'published' })
              .select('title slug')
              .limit(3)
              .lean(),
            Restaurant.find({ ...searchQuery, isActive: true })
              .select('name slug')
              .limit(3)
              .lean(),
            User.find({ ...searchQuery, isActive: true })
              .select('username name')
              .limit(3)
              .lean(),
          ]);

          results = [
            ...recipeResults.map((r: any) => ({ ...r, type: 'recipe' })),
            ...restaurantResults.map((r: any) => ({ ...r, type: 'restaurant' })),
            ...userResults.map((u: any) => ({ ...u, type: 'user' })),
          ];
          break;
      }

      return results;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get popular searches
   */
  static async getPopularSearches(limit = 5) {
    try {
      // In a real app, you'd track search queries and their popularity
      // For now, return some default popular searches
      return [
        'Injera',
        'Doro Wat',
        'Tibs',
        'Kitfo',
        'Ethiopian Coffee',
      ].slice(0, limit);
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }
}

export default SearchService;
