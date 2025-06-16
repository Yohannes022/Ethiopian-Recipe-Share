import { Document, Model, Types } from 'mongoose';

export interface IOrderItemBase {
  menuItem: Types.ObjectId;
  quantity: number;
  price: number;
  notes?: string;
}

export interface IOrderItem extends IOrderItemBase {
  menuItem: Types.ObjectId;
}

export interface IOrderItemWithDetails extends IOrderItemBase {
  menuItem: Types.ObjectId;
  menuItemDetails?: {
    name: string;
    description: string;
    price: number;
    image: string;
  };
}

export interface IOrderBase {
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

export interface IOrder extends Document, IOrderBase {
  user: Types.ObjectId;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface IOrderMethods {
  calculateTotal(): void;
  updateStatus(newStatus: OrderStatus): void;
  addDeliveryFee(fee: number): void;
  addTax(tax: number): void;
}

export type OrderModel = Model<IOrder, {}, IOrderMethods>;

export interface IOrderWithDetails extends IOrderBase {
  user: Types.ObjectId;
  userInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  restaurant: Types.ObjectId;
  restaurantInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  items: IOrderItem[];
  menuItems?: IOrderItemWithDetails[];
}
