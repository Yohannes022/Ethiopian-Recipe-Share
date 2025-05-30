import mongoose from 'mongoose';
import User from '@/models/User';
import Restaurant from '@/models/Restaurant';
import Category from '@/models/Category';
import MenuItem from '@/models/MenuItem';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
    ]);

    // Create initial categories
    const categories = await Category.insertMany([
      { name: 'Main Dishes', type: 'recipe' },
      { name: 'Desserts', type: 'recipe' },
      { name: 'Beverages', type: 'recipe' },
      { name: 'Ethiopian', type: 'restaurant' },
      { name: 'Modern', type: 'restaurant' },
    ]);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ethiopianrecipe.com',
      password: 'admin123',
      role: 'admin',
      verified: true,
    });

    // Create sample restaurant
    const restaurant = await Restaurant.create({
      name: 'Addis Ababa Restaurant',
      description: 'Traditional Ethiopian cuisine',
      address: {
        street: '123 Main St',
        city: 'Addis Ababa',
        state: 'AA',
        country: 'Ethiopia',
        zipCode: '1000',
      },
      owner: admin._id,
      categories: [categories[3]._id],
      contact: {
        email: 'info@addisrestaurant.com',
        phone: '+251 11 123 4567',
      },
    });

    // Create menu items
    await MenuItem.create([
      {
        name: 'Injera',
        description: 'Traditional Ethiopian flatbread',
        price: 50,
        category: 'appetizer',
        image: 'injera.jpg',
        restaurant: restaurant._id,
      },
      {
        name: 'Doro Wat',
        description: 'Spicy chicken stew',
        price: 150,
        category: 'main',
        image: 'doro-wat.jpg',
        restaurant: restaurant._id,
      },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
