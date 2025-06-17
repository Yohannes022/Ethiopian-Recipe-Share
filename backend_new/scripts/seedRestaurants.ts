import 'module-alias/register';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Restaurant from '../src/models/restaurant.model';
import User from '../src/models/user.model';
import { connectDB } from '../src/config/database';

dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleRestaurants = [
  {
    name: 'Habesha Restaurant',
    description: 'Authentic Ethiopian cuisine with a modern twist',
    address: {
      street: 'Bole Road',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000',
      country: 'Ethiopia',
      coordinates: [38.7896, 9.0320] // Longitude, Latitude
    },
    phone: '+251911223344',
    email: 'info@habesha.com',
    website: 'https://habesha-restaurant.com',
    cuisineType: ['Ethiopian', 'African'],
    menu: [
      {
        name: 'Doro Wot',
        description: 'Spicy chicken stew with hard-boiled eggs',
        price: 250,
        category: 'Main Course',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        isSpicy: true,
        isAvailable: true
      },
      {
        name: 'Injera',
        description: 'Traditional Ethiopian sourdough flatbread',
        price: 50,
        category: 'Bread',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        isAvailable: true
      },
      {
        name: 'Tibs',
        description: 'Sautéed meat with vegetables and spices',
        price: 280,
        category: 'Main Course',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        isSpicy: true,
        isAvailable: true
      }
    ],
    images: [
      'habesha1.jpg',
      'habesha2.jpg'
    ],
    rating: {
      average: 4.5,
      count: 120
    },
    isFeatured: true,
    deliveryOptions: {
      delivery: true,
      pickup: true,
      minimumOrder: 100,
      deliveryFee: 30,
      freeDeliveryOver: 500
    }
  }
];

const seedRestaurants = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Find an admin user to set as owner
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Clear existing restaurants
    await Restaurant.deleteMany({});
    console.log('Cleared existing restaurants');

    // Add owner to each restaurant
    const restaurantsWithOwner = sampleRestaurants.map(restaurant => ({
      ...restaurant,
      owner: admin._id
    }));

    // Insert sample restaurants
    const createdRestaurants = await Restaurant.insertMany(restaurantsWithOwner);
    console.log(`Successfully seeded ${createdRestaurants.length} restaurants`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding restaurants:', error);
    process.exit(1);
  }
};

// Run the seeder
seedRestaurants();
