const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Load models
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Order = require('../models/Order');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// Read JSON files
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf-8')
);

const restaurants = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'restaurants.json'), 'utf-8')
);

const menuItems = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'menu.json'), 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Menu.deleteMany();
    await Order.deleteMany();

    // Create users
    const createdUsers = await User.create(users);
    
    // Get admin user
    const adminUser = createdUsers.find(user => user.role === 'admin');
    const customerUser = createdUsers.find(user => user.role === 'user');

    // Add user to restaurants
    const restaurantsWithUser = restaurants.map(restaurant => ({
      ...restaurant,
      user: adminUser._id
    }));

    // Create restaurants
    const createdRestaurants = await Restaurant.create(restaurantsWithUser);
    
    // Add restaurant to menu items
    const menuItemsWithRestaurant = menuItems.map((menuItem, index) => ({
      ...menuItem,
      restaurant: createdRestaurants[0]._id,
      user: adminUser._id
    }));

    // Create menu items
    const createdMenuItems = await Menu.create(menuItemsWithRestaurant);

    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Menu.deleteMany();
    await Order.deleteMany();

    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Handle command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please specify -i to import data or -d to delete data'.yellow);
  process.exit(1);
}
