import 'module-alias/register';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/user.model';
import { connectDB } from '../src/config/database';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Clear existing users (be careful with this in production)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+251911223344',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true
    });

    console.log(`Created admin user with email: ${adminUser.email}`);
    
    // Create a regular user
    const userPassword = await bcrypt.hash('user123', 12);
    
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      phone: '+251911223345',
      password: userPassword,
      role: 'user',
      isEmailVerified: true
    });

    console.log(`Created regular user with email: ${regularUser.email}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();
