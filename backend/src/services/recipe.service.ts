import { IRecipe, IRecipeService } from '../interfaces/recipe.interface';
import { Recipe } from '../models/Recipe';
import { CreateRecipeDto, RecipeQueryDto } from '../dto/recipe.dto';
import { FilterQuery, Types } from 'mongoose';
import { ApiError } from '../utils/apiError';
import httpStatus from 'http-status';
import { IUser } from '../interfaces/user.interface';

export class RecipeService implements IRecipeService {
  async createRecipe(createRecipeDto: CreateRecipeDto, userId: string): Promise<IRecipe> {
    const recipe = new Recipe({
      ...createRecipeDto,
      createdBy: userId,
      likes: [],
      reviewCount: 0,
      isPublic: createRecipeDto.isPublic ?? true,
    });

    await recipe.save();
    return recipe.populate('createdBy', 'name email avatar');
  }

  async getRecipeById(id: string): Promise<IRecipe> {
    const recipe = await Recipe.findById(id)
      .populate('createdBy', 'name email avatar')
      .populate('category', 'name')
      .populate('likes', 'name avatar');

    if (!recipe) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Recipe not found');
    }

    return recipe;
  }

  async updateRecipe(
    id: string,
    updateRecipeDto: Partial<CreateRecipeDto>,
    userId: string
  ): Promise<IRecipe> {
    const recipe = await Recipe.findOne({ _id: id, createdBy: userId });

    if (!recipe) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Recipe not found or you do not have permission to update this recipe'
      );
    }

    Object.assign(recipe, updateRecipeDto);
    await recipe.save();
    return recipe.populate('createdBy', 'name email avatar');
  }

  async deleteRecipe(id: string, userId: string): Promise<void> {
    const recipe = await Recipe.findOneAndDelete({ _id: id, createdBy: userId });

    if (!recipe) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Recipe not found or you do not have permission to delete this recipe'
      );
    }
  }

  async getRecipes(query: RecipeQueryDto): Promise<{ data: IRecipe[]; total: number }> {
    const {
      search,
      category,
      difficulty,
      minPrepTime,
      maxPrepTime,
      isPublic = true,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const filter: FilterQuery<IRecipe> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'ingredients.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (minPrepTime || maxPrepTime) {
      filter.prepTime = {};
      if (minPrepTime) filter.prepTime.$gte = minPrepTime;
      if (maxPrepTime) filter.prepTime.$lte = maxPrepTime;
    }

    filter.isPublic = isPublic;

    const sortOptions: Record<string, 'asc' | 'desc'> = {};
    sortOptions[sortBy] = sortOrder as 'asc' | 'desc';

    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email avatar')
        .populate('category', 'name'),
      Recipe.countDocuments(filter),
    ]);

    return { data: recipes, total };
  }

  async likeRecipe(recipeId: string, userId: string): Promise<{ isLiked: boolean }> {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Recipe not found');
    }

    const userIdObj = new Types.ObjectId(userId);
    const isLiked = recipe.likes.includes(userIdObj);

    if (isLiked) {
      recipe.likes = recipe.likes.filter(
        (id) => id.toString() !== userId
      ) as Types.ObjectId[];
    } else {
      recipe.likes.push(userIdObj);
    }

    await recipe.save();
    return { isLiked: !isLiked };
  }

  async addComment(recipeId: string, userId: string, text: string): Promise<IRecipe> {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Recipe not found');
    }

    recipe.comments.push({
      user: new Types.ObjectId(userId),
      text,
      createdAt: new Date(),
    });

    await recipe.save();
    return recipe.populate('comments.user', 'name avatar');
  }

  async getUserRecipes(userId: string, isCurrentUser: boolean): Promise<IRecipe[]> {
    const filter: FilterQuery<IRecipe> = { createdBy: userId };
    
    // If not the current user, only show public recipes
    if (!isCurrentUser) {
      filter.isPublic = true;
    }

    return Recipe.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email avatar')
      .populate('category', 'name');
  }

  async searchRecipes(query: string, filters: any = {}): Promise<IRecipe[]> {
    const searchQuery: any = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'ingredients.name': { $regex: query, $options: 'i' } },
      ],
      isPublic: true,
      ...filters,
    };

    return Recipe.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('createdBy', 'name avatar')
      .populate('category', 'name');
  }
}

export const recipeService = new RecipeService();
