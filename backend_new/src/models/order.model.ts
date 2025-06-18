import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './user.model';
import { IRestaurant } from './restaurant.model';
import { IMenuItem } from './menuItem.model';

export interface IOrderItem {
  menuItem: Types.ObjectId | IMenuItem;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready_for_pickup' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export interface IPaymentDetails {
  method: 'cash' | 'card' | 'mobile_money';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  amount: number;
  currency: string;
  paidAt?: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId | IUser;
  restaurant: Types.ObjectId | IRestaurant;
  items: IOrderItem[];
  status: OrderStatus;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: [number, number];
  };
  deliveryInstructions?: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  payment: IPaymentDetails;
  scheduledFor?: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  menuItem: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  specialInstructions: String
});

const paymentDetailsSchema = new Schema<IPaymentDetails>({
  method: {
    type: String,
    enum: ['cash', 'card', 'mobile_money'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  paidAt: Date
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ],
      default: 'pending'
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'Ethiopia' },
      coordinates: [Number] // [longitude, latitude]
    },
    deliveryInstructions: String,
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    payment: paymentDetailsSchema,
    scheduledFor: Date,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    cancellationReason: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ restaurant: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });

// Pre-save hook to generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const OrderModel = this.constructor as any;
    const count = await OrderModel.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
