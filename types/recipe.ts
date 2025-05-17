export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard" | string; // Allow string for backward compatibility
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  region?: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  isFavorite?: boolean; // Alias for isSaved
  rating: number;
  ratingCount: number;
  comments: Comment[];
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface Step {
  id: string;
  description: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likes?: number;
  replies?: Comment[];
}

export interface RecipeCategory {
  id: string;
  name: string;
  imageUrl: string;
}

export interface RecipeRegion {
  id: string;
  name: string;
  imageUrl: string;
}

export interface RecipeCuisine {
  id: string;
  name: string;
  imageUrl: string;
}
export interface RecipeTag {
  id: string;
  name: string;
  imageUrl: string;
}


export interface RecipeFilter {
  id: string;
  name: string;
  imageUrl: string;
  isSelected: boolean;
}
export interface RecipeSortOption {
  id: string;
  name: string;
  value: string;
}
export interface RecipeSearchResult {
  recipes: Recipe[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  location: string;
  recipes: string[];
  savedRecipes: string[];
  followers: number;
  following: number;
  avatar: string;
  avatarUrl: string;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}
