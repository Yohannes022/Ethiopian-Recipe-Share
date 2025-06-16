import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const API_URL = 'http://localhost:5000/api/v1/recipes';

interface SearchParams {
  q?: string;
  cuisine?: string;
  difficulty?: string;
  mealType?: string;
  dietaryRestrictions?: string;
  maxPrepTime?: number;
  maxCookTime?: number;
  minRating?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

async function testSearch(params: SearchParams) {
  try {
    console.log('Testing search with params:', JSON.stringify(params, null, 2));
    const response = await axios.get(`${API_URL}/search`, { params });
    
    console.log('Search Results:');
    console.log(`Total Results: ${response.data.total}`);
    console.log(`Page: ${response.data.currentPage} of ${response.data.totalPages}`);
    console.log('Recipes found:');
    
    response.data.data.recipes.forEach((recipe: any, index: number) => {
      console.log(`\n${index + 1}. ${recipe.title} (${recipe.cuisine})`);
      console.log(`   Difficulty: ${recipe.difficulty}, Prep: ${recipe.prepTime}m, Cook: ${recipe.cookTime}m`);
      console.log(`   Rating: ${recipe.averageRating || 'N/A'}`);
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Search error:', error.response?.data || error.message);
    throw error;
  }
}

// Test cases
async function runTests() {
  try {
    console.log('=== Testing Recipe Search ===\n');
    
    // Test 1: Basic search
    console.log('\n=== Test 1: Basic search (query: "chicken") ===');
    await testSearch({ q: 'chicken' });
    
    // Test 2: Filter by cuisine
    console.log('\n=== Test 2: Filter by cuisine (Ethiopian) ===');
    await testSearch({ cuisine: 'Ethiopian' });
    
    // Test 3: Filter by difficulty
    console.log('\n=== Test 3: Filter by difficulty (easy) ===');
    await testSearch({ difficulty: 'easy' });
    
    // Test 4: Filter by meal type
    console.log('\n=== Test 4: Filter by meal type (dinner) ===');
    await testSearch({ mealType: 'dinner' });
    
    // Test 5: Filter by dietary restrictions
    console.log('\n=== Test 5: Filter by dietary restrictions (vegan) ===');
    await testSearch({ dietaryRestrictions: 'vegan' });
    
    // Test 6: Filter by preparation time
    console.log('\n=== Test 6: Filter by max preparation time (30 minutes) ===');
    await testSearch({ maxPrepTime: 30 });
    
    // Test 7: Sort by rating
    console.log('\n=== Test 7: Sort by rating ===');
    await testSearch({ sortBy: 'rating' });
    
    console.log('\n=== All tests completed successfully! ===');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();
