const mongoose = require('mongoose');
const slugify = require('slugify');

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    slug: String,
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be a positive number'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare at price must be a positive number'],
      default: 0,
    },
    costPerItem: {
      type: Number,
      min: [0, 'Cost per item must be a positive number'],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    barcode: String,
    trackQuantity: {
      type: Boolean,
      default: false,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    weight: {
      value: {
        type: Number,
        min: [0, 'Weight must be a positive number'],
      },
      unit: {
        type: String,
        enum: ['g', 'kg', 'oz', 'lb', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'piece'],
        default: 'g',
      },
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'appetizer',
        'main',
        'dessert',
        'beverage',
        'side',
        'breakfast',
        'lunch',
        'dinner',
        'combo',
        'special',
      ],
    },
    subcategory: String,
    cuisineType: {
      type: [String],
      required: [true, 'Please add at least one cuisine type'],
      enum: [
        'Ethiopian',
        'African',
        'Vegetarian',
        'Vegan',
        'Gluten-Free',
        'International',
        'Fusion',
      ],
    },
    dietaryInfo: {
      isVegetarian: { type: Boolean, default: false },
      isVegan: { type: Boolean, default: false },
      isGlutenFree: { type: Boolean, default: false },
      isDairyFree: { type: Boolean, default: false },
      isNutFree: { type: Boolean, default: false },
      isHalal: { type: Boolean, default: false },
      isKosher: { type: Boolean, default: false },
    },
    spiceLevel: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Spice level must be an integer between 0 and 5',
      },
    },
    ingredients: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        unit: {
          type: String,
          enum: ['g', 'kg', 'oz', 'lb', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'piece'],
          default: 'g',
        },
        isAllergen: { type: Boolean, default: false },
      },
    ],
    allergens: [String],
    nutritionInfo: {
      calories: { type: Number, min: 0 },
      protein: { type: Number, min: 0 },
      carbs: { type: Number, min: 0 },
      fat: { type: Number, min: 0 },
      fiber: { type: Number, min: 0 },
      sugar: { type: Number, min: 0 },
      sodium: { type: Number, min: 0 },
    },
    preparationTime: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['minutes', 'hours'], default: 'minutes' },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: 'Menu item image' },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    variants: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        compareAtPrice: { type: Number, min: 0 },
        sku: String,
        barcode: String,
        quantity: { type: Number, default: 0, min: 0 },
      },
    ],
    addons: [
      {
        name: { type: String, required: true },
        options: [
          {
            name: { type: String, required: true },
            price: { type: Number, required: true, min: 0 },
          },
        ],
        minSelections: { type: Number, min: 0, default: 0 },
        maxSelections: { type: Number, min: 1 },
        isRequired: { type: Boolean, default: false },
      },
    ],
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Please add a restaurant'],
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create menu item slug from the name
MenuItemSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Generate SKU before saving if not provided
MenuItemSchema.pre('save', function (next) {
  if (!this.sku) {
    // Generate a simple SKU from name and random string
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const namePart = this.name
      .replace(/[^\w\s]/gi, '')
      .substring(0, 3)
      .toUpperCase();
    this.sku = `${namePart}-${random}`;
  }
  next();
});

// Update the updatedBy field before saving
MenuItemSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Cascade delete menu item from restaurant's menu when deleted
MenuItemSchema.pre('remove', async function (next) {
  await this.model('Restaurant').updateMany(
    { menu: this._id },
    { $pull: { menu: this._id } }
  );
  next();
});

// Static method to get average price of menu items by category
MenuItemSchema.statics.getAveragePrice = async function (restaurantId) {
  const obj = await this.aggregate([
    {
      $match: { restaurant: restaurantId },
    },
    {
      $group: {
        _id: '$category',
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        count: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
      menuPriceRanges: obj,
    });
  } catch (err) {
    console.error('Error updating menu price ranges:', err);
  }
};

// Call getAveragePrice after save or remove
MenuItemSchema.post('save', function () {
  this.constructor.getAveragePrice(this.restaurant);
});

MenuItemSchema.post('remove', function () {
  this.constructor.getAveragePrice(this.restaurant);
});

// Create text index for search
MenuItemSchema.index({
  name: 'text',
  description: 'text',
  'ingredients.name': 'text',
  category: 'text',
  cuisineType: 'text',
});

// Create compound index for restaurant and category
MenuItemSchema.index({ restaurant: 1, category: 1 });

module.exports = mongoose.model('Menu', MenuItemSchema);
