import { Request, Response } from 'express';
import Recipe from '@/models/recipe.model';
import Restaurant from '@/models/restaurant.model';
import User from '@/models/user.model';
import { StatusCodes } from 'http-status-codes';

interface SearchResult {
  type: 'recipe' | 'restaurant' | 'user';
  score: number;
  data: {
    _id: string;
    name: string;
    createdAt: Date;
    [key: string]: any;
  };
}

interface TextSearchResult {
  score: number;
  _id: string;
  name: string;
  createdAt: Date;
  [key: string]: any;
};

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Search recipes
    const recipes = await Recipe.find({
      $text: {
        $search: query,
        $caseSensitive: false,
        $diacriticSensitive: false
      }
    }).select('name description ingredients rating restaurant createdAt')
      .limit(5)
      .lean() as any[];

    // Add text score to each recipe
    const recipesWithScore = recipes.map(r => ({
      ...r,
      score: r.score || 0
    }));

    // Search restaurants
    const restaurants = await Restaurant.find({
      $text: {
        $search: query,
        $caseSensitive: false,
        $diacriticSensitive: false
      }
    }).select('name description cuisineType rating createdAt')
      .limit(5)
      .lean() as any[];

    // Add text score to each restaurant
    const restaurantsWithScore = restaurants.map(r => ({
      ...r,
      score: r.score || 0
    }));

    // Search users
    const users = await User.find({
      $text: {
        $search: query,
        $caseSensitive: false,
        $diacriticSensitive: false
      }
    }).select('name email role profilePicture createdAt')
      .limit(5)
      .lean() as any[];

    // Add text score to each user
    const usersWithScore = users.map(u => ({
      ...u,
      score: u.score || 0
    }));

    // Combine results and add type information
    const results: SearchResult[] = [
      ...recipesWithScore.map(r => ({ 
        type: 'recipe' as const, 
        score: r.score,
        data: r
      })),
      ...restaurantsWithScore.map(r => ({ 
        type: 'restaurant' as const, 
        score: r.score,
        data: r
      })),
      ...usersWithScore.map(u => ({ 
        type: 'user' as const, 
        score: u.score,
        data: u
      }))
    ];

    // Sort by score (relevance) and then by creation date
    results.sort((a, b) => {
      if (a.score === b.score) {
        return new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime();
      }
      return b.score - a.score;
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: results
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
};
