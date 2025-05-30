"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("@/models/User"));
const Restaurant_1 = __importDefault(require("@/models/Restaurant"));
const Category_1 = __importDefault(require("@/models/Category"));
const MenuItem_1 = __importDefault(require("@/models/MenuItem"));
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        // Clear existing data
        await Promise.all([
            User_1.default.deleteMany({}),
            Restaurant_1.default.deleteMany({}),
            Category_1.default.deleteMany({}),
            MenuItem_1.default.deleteMany({}),
        ]);
        // Create initial categories
        const categories = await Category_1.default.insertMany([
            { name: 'Main Dishes', type: 'recipe' },
            { name: 'Desserts', type: 'recipe' },
            { name: 'Beverages', type: 'recipe' },
            { name: 'Ethiopian', type: 'restaurant' },
            { name: 'Modern', type: 'restaurant' },
        ]);
        // Create admin user
        const admin = await User_1.default.create({
            name: 'Admin User',
            email: 'admin@ethiopianrecipe.com',
            password: 'admin123',
            role: 'admin',
            verified: true,
        });
        // Create sample restaurant
        const restaurant = await Restaurant_1.default.create({
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
        await MenuItem_1.default.create([
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
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
seedDatabase();
