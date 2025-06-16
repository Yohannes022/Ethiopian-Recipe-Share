import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function testConnection() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethiopian_recipe_share';
  
  console.log('Testing MongoDB connection...');
  console.log('MongoDB URI:', MONGODB_URI);
  
  try {
    // Set connection options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, options as any);
    console.log('✅ Successfully connected to MongoDB');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach((db: any) => {
      console.log(`- ${db.name} (size: ${(db.sizeOnDisk / (1024 * 1024)).toFixed(2)} MB)`);
    });
    
    // List collections in the current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in current database:');
    collections.forEach((collection: any) => {
      console.log(`- ${collection.name}`);
    });
    
    // Test a simple query
    if (collections.some((c: any) => c.name === 'recipes')) {
      const Recipe = mongoose.model('Recipe');
      const count = await Recipe.countDocuments();
      console.log(`\nFound ${count} recipes in the database`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
