import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from '../src/models/recipe.model';

dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethiopian_recipe_share';

// Log all environment variables for debugging (excluding sensitive ones)
console.log('Environment Variables:');
Object.entries(process.env).forEach(([key, value]) => {
  if (!key.toLowerCase().includes('password') && !key.toLowerCase().includes('secret') && !key.toLowerCase().includes('key')) {
    console.log(`  ${key}: ${value}`);
  } else {
    console.log(`  ${key}: [REDACTED]`);
  }
});

async function listRecipes() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    } as any);
    console.log('Successfully connected to MongoDB');
    
    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    const recipes = await Recipe.find({});
    console.log(`Found ${recipes.length} recipes in the database:`);
    
    recipes.forEach((recipe, index) => {
      console.log(`\n${index + 1}. ${recipe.title} (${recipe.cuisine})`);
      console.log(`   ${recipe.description}`);
      console.log(`   Public: ${recipe.isPublic}, Created: ${recipe.createdAt}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing recipes:', error);
    process.exit(1);
  }
}

listRecipes();
