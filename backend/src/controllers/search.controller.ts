import { Request, Response, NextFunction } from 'express';
import Recipe from '@/models/Recipe';
import Restaurant from '@/models/Restaurant';
import User from '@/models/User';
import { BadRequestError } from '@/utils/apiError';
import { protect } from '../middleware/auth';

interface ISearchResult {
  type: 'recipe' | 'restaurant' | 'user';
  _id: string;
  name: string;
  description?: string;
  image?: string;
  rating?: number;
  category?: string;
}

// Global search across recipes, restaurants, and users
export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, type, page = 1, limit = 10 } = req.query;

    if (!query) {
      throw new BadRequestError('Search query is required');
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build search query
    const searchQuery = {
      $text: { $search: query.toString() },
    };

    // Search across all types if no type specified
    let results: ISearchResult[] = [];

    if (!type || type === 'recipe') {
      const recipes = await Recipe.find(searchQuery)
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(Number(limit))
        .select('name description image rating category')
        .populate('category', 'name');

      results = [...results, ...recipes.map(recipe => ({
        type: 'recipe',
        _id: recipe._id,
        name: recipe.name,
        description: recipe.description,
        image: recipe.image,
        rating: recipe.rating,
        category: recipe.category?.name,
      }))];
    }

    if (!type || type === 'restaurant') {
      const restaurants = await Restaurant.find(searchQuery)
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(Number(limit))
        .select('name description image rating');

      results = [...results, ...restaurants.map(restaurant => ({
        type: 'restaurant',
        _id: restaurant._id,
        name: restaurant.name,
        description: restaurant.description,
        image: restaurant.image,
        rating: restaurant.rating,
      }))];
    }

    if (!type || type === 'user') {
      const users = await User.find(searchQuery)
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(Number(limit))
        .select('name bio photo');

      results = [...results, ...users.map(user => ({
        type: 'user',
        _id: user._id,
        name: user.name,
        description: user.bio,
        image: user.photo,
      }))];
    }

    // Get total count
    const total = await Promise.all([
      !type || type === 'recipe' ? Recipe.countDocuments(searchQuery) : 0,
      !type || type === 'restaurant' ? Restaurant.countDocuments(searchQuery) : 0,
      !type || type === 'user' ? User.countDocuments(searchQuery) : 0,
    ]).then(counts => counts.reduce((sum, count) => sum + count, 0));

    res.status(200).json({
      status: 'success',
      results: results.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// Advanced search with filters
export const advancedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      type,
      category,
      minRating,
      maxRating,
      location,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build query based on type
    let query: any = {};
    let model: any;

    switch (type) {
      case 'recipe':
        model = Recipe;
        if (category) query.category = category;
        if (minRating) query.rating = { $gte: Number(minRating) };
        if (maxRating) query.rating = { $lte: Number(maxRating) };
        break;

      case 'restaurant':
        model = Restaurant;
        if (category) query.categories = category;
        if (minRating) query.rating = { $gte: Number(minRating) };
        if (maxRating) query.rating = { $lte: Number(maxRating) };
        if (location) {
          const [lat, lng] = location.toString().split(',').map(Number);
          query.location = {
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: 5000, // 5km radius
            },
          };
        }
        break;

      case 'user':
        model = User;
        break;

      default:
        throw new BadRequestError('Invalid search type');
    }

    // Build sort options
    const sortOptions: any = {};
    if (sort === 'rating') sortOptions.rating = -1;
    else if (sort === 'name') sortOptions.name = 1;
    else if (sort === 'distance' && type === 'restaurant') {
      sortOptions.location = 1;
    }

    // Execute search
    const [results, total] = await Promise.all([
      model.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      model.countDocuments(query),
    ]);

    res.status(200).json({
      status: 'success',
      results: results.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
