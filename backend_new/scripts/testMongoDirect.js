const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

async function testMongoConnection() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethiopian_recipe_share';
  
  console.log('Testing MongoDB connection...');
  console.log('MongoDB URI:', MONGODB_URI);
  
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (size: ${(db.sizeOnDisk / (1024 * 1024).toFixed(2))} MB)`);
    });
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    console.log('\nCollections in current database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    if (collections.some(c => c.name === 'recipes')) {
      const recipes = db.collection('recipes');
      const count = await recipes.countDocuments();
      console.log(`\nFound ${count} recipes in the database`);
      
      if (count > 0) {
        const sampleRecipe = await recipes.findOne({});
        console.log('\nSample recipe:');
        console.log(JSON.stringify(sampleRecipe, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    if (error.name === 'MongoServerSelectionError') {
      console.error('\nThis usually means the MongoDB server is not running or the connection string is incorrect.');
      console.error('Please make sure MongoDB is running and the connection string is correct.');
    }
  } finally {
    await client.close();
  }
}

testMongoConnection();
