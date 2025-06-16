import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from '../src/models/recipe.model';
import User from '../src/models/user.model';

dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethiopian-recipe-share';

const sampleUsers = [
  {
    name: 'Test User 1',
    email: 'test1@example.com',
    password: 'password123',
    passwordConfirm: 'password123'
  },
  {
    name: 'Test User 2',
    email: 'test2@example.com',
    password: 'password123',
    passwordConfirm: 'password123'
  }
];

const sampleRecipes = [
  {
    title: 'Doro Wat',
    description: 'Spicy Ethiopian chicken stew',
    ingredients: [
      { name: 'chicken', quantity: 1, unit: 'whole', notes: 'cut into pieces' },
      { name: 'onions', quantity: 3, unit: 'large', notes: 'finely chopped' },
      { name: 'berbere spice', quantity: 3, unit: 'tbsp', notes: 'Ethiopian spice blend' }
    ],
    instructions: [
      { step: 1, description: 'Sauté onions until golden brown' },
      { step: 2, description: 'Add berbere spice and cook for 2 minutes' },
      { step: 3, description: 'Add chicken and simmer until cooked through' }
    ],
    prepTime: 30,
    cookTime: 60,
    servings: 4,
    difficulty: 'medium',
    cuisine: 'Ethiopian',
    mealType: ['dinner', 'lunch'],
    dietaryRestrictions: ['gluten-free'],
    isPublic: true,
    likes: [],
    comments: [],
    ratings: []
  },
  {
    title: 'Injera',
    description: 'Traditional Ethiopian sourdough flatbread',
    ingredients: [
      { name: 'teff flour', quantity: 2, unit: 'cups' },
      { name: 'water', quantity: 3, unit: 'cups' },
      { name: 'salt', quantity: 0.5, unit: 'tsp' }
    ],
    instructions: [
      { step: 1, description: 'Mix teff flour and water' },
      { step: 2, description: 'Let ferment for 2-3 days' },
      { step: 3, description: 'Cook on a griddle like a pancake' }
    ],
    prepTime: 20,
    cookTime: 30,
    servings: 8,
    difficulty: 'hard',
    cuisine: 'Ethiopian',
    mealType: ['breakfast', 'dinner', 'lunch'],
    dietaryRestrictions: ['vegan', 'gluten-free'],
    isPublic: true,
    likes: [],
    comments: [],
    ratings: []
  },
  {
    title: 'Shiro Wat',
    description: 'Flavorful chickpea stew',
    ingredients: [
      { name: 'shiro powder', quantity: 2, unit: 'cups' },
      { name: 'onions', quantity: 2, unit: 'large' },
      { name: 'garlic', quantity: 4, unit: 'cloves' }
    ],
    instructions: [
      { step: 1, description: 'Sauté onions and garlic' },
      { step: 2, description: 'Add shiro powder and water' },
      { step: 3, description: 'Simmer until thickened' }
    ],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'easy',
    cuisine: 'Ethiopian',
    mealType: ['dinner', 'lunch'],
    dietaryRestrictions: ['vegan', 'gluten-free', 'dairy-free'],
    isPublic: true,
    likes: [],
    comments: [],
    ratings: []
  }
];

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Recipe.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await User.create(sampleUsers);
    console.log(`Created ${users.length} users`);

    // Add users to recipes
    const recipesWithUsers = sampleRecipes.map((recipe, index) => ({
      ...recipe,
      user: users[index % users.length]._id
    }));

    // Create recipes
    const createdRecipes = await Recipe.create(recipesWithUsers);
    console.log(`Created ${createdRecipes.length} recipes`);

    // Add some ratings
    const recipes = await Recipe.find();
    for (const recipe of recipes) {
      // Each recipe gets a random number of ratings (1-3)
      const numRatings = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numRatings; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomRating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
        
        // Convert user ID to ObjectId if it's a string
        const userId = typeof randomUser._id === 'string' 
          ? new Types.ObjectId(randomUser._id) 
          : randomUser._id;
          
        recipe.ratings.push({
          user: userId,
          rating: randomRating
        });
      }
      await recipe.save();
    }
    console.log('Added ratings to recipes');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
