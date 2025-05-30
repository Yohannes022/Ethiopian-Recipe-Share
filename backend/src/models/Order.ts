import mongoose, { Schema, Document, Model } from 'mongoose';
import { IOrder, IOrderMethods, OrderModel } from '@/types/order.types';

const orderSchema = new mongoose.Schema<IOrder, OrderModel, IOrderMethods>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Order must belong to a restaurant'],
    },
    items: [{
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: [true, 'Order item must have a menu item'],
      },
      quantity: {
        type: Number,
        required: [true, 'Order item must have a quantity'],
        min: [1, 'Quantity must be at least 1'],
      },
      price: {
        type: Number,
        required: [true, 'Order item must have a price'],
        min: [0, 'Price cannot be negative'],
      },
      notes: {
        type: String,
        trim: true,
      },
    }],
    total: {
      type: Number,
      required: [true, 'Order must have a total amount'],
      min: [0, 'Total cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
      default: 'cash',
    },
    deliveryAddress: {
      address: {
        type: String,
        required: [true, 'Delivery address must have an address'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Delivery address must have a city'],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Delivery address must have a country'],
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    deliveryInstructions: {
      type: String,
      trim: true,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ restaurant: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual populate
orderSchema.virtual('user', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  select: 'name phone email',
});

orderSchema.virtual('restaurant', {
  ref: 'Restaurant',
  localField: 'restaurant',
  foreignField: '_id',
  justOne: true,
  select: 'name phone email',
});

orderSchema.virtual('items', {
  ref: 'MenuItem',
  localField: 'items.menuItem',
  foreignField: '_id',
  justOne: true,
  select: 'name description price image',
});

// Instance methods
orderSchema.methods.calculateTotal = function () {
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

orderSchema.methods.updateStatus = function (newStatus: string) {
  this.status = newStatus;
};

orderSchema.methods.addDeliveryFee = function (fee: number) {
  this.deliveryFee = fee;
  this.calculateTotal();
};

orderSchema.methods.addTax = function (tax: number) {
  this.tax = tax;
  this.calculateTotal();
};

// Pre-save middleware to calculate total before saving
orderSchema.pre('save', function (next) {
  this.calculateTotal();
  next();
});

// Create and export the model
const Order = mongoose.model<IOrder, OrderModel>('Order', orderSchema);
export default Order;
