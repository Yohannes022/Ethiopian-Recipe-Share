import { Document, Model, Types } from 'mongoose';

export interface IOrderItem {
  menuItem: Types.ObjectId;
  quantity: number;
  price: number;
  notes?: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  restaurant: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cash' | 'card' | 'online';
  deliveryAddress: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: [number, number];
  };
  deliveryInstructions?: string;
  specialRequests?: string;
  deliveryFee: number;
  tax: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderMethods {
  calculateTotal(): void;
  updateStatus(newStatus: string): void;
  addDeliveryFee(fee: number): void;
  addTax(tax: number): void;
}

export type OrderModel = Model<IOrder, {}, IOrderMethods>;

export interface IOrderWithDetails extends IOrder {
  user?: {
    name: string;
    phone: string;
    email: string;
  };
  restaurant?: {
    name: string;
    phone: string;
    email: string;
  };
  items?: {
    menuItem: {
      name: string;
      description: string;
      price: number;
      image: string;
    };
    quantity: number;
    price: number;
    notes?: string;
  }[];
}
