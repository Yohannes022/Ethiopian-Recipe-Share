import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  ON_DELIVERY = 'onDelivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  VOIDED = 'voided',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
}

export interface IOrderItem {
  menuItem: Types.ObjectId | string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  options?: {
    name: string;
    choices: Array<{
      name: string;
      price: number;
    }>;
  }[];
  total: number;
}

export interface IDeliveryAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  formattedAddress?: string;
  contactNumber: string;
  contactName: string;
}

export interface IPaymentDetails {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentIntentId?: string;
  paymentMethodId?: string;
  paymentReceiptUrl?: string;
  amountPaid: number;
  currency: string;
  paymentDate?: Date;
  refunds?: Array<{
    amount: number;
    reason?: string;
    date: Date;
    refundId?: string;
  }>;
  cardDetails?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    country: string;
    funding: string;
  };
}

export interface IDeliveryDetails {
  provider?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  deliveryFee: number;
  deliveryInstructions?: string;
  driver?: {
    id: Types.ObjectId | string;
    name: string;
    phone: string;
    photo?: string;
    vehicle?: {
      type: string;
      number: string;
    };
  };
  statusUpdates: Array<{
    status: OrderStatus;
    timestamp: Date;
    note?: string;
    updatedBy: {
      id: Types.ObjectId | string;
      name: string;
      role: string;
    };
  }>;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId | string;
  restaurant: Types.ObjectId | string;
  items: IOrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount?: {
    code?: string;
    amount: number;
    type: 'percentage' | 'fixed';
    description?: string;
  };
  total: number;
  currency: string;
  deliveryAddress: IDeliveryAddress;
  billingAddress?: IDeliveryAddress;
  payment: IPaymentDetails;
  delivery: IDeliveryDetails;
  specialInstructions?: string;
  scheduledFor?: Date;
  isScheduled: boolean;
  isTakeaway: boolean;
  customerNotes?: string;
  internalNotes?: string;
  cancellationReason?: string;
  cancelledBy?: {
    id: Types.ObjectId | string;
    name: string;
    role: string;
  };
  cancellationDate?: Date;
  refundAmount?: number;
  refundReason?: string;
  refundDate?: Date;
  rating?: number;
  review?: string;
  reviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
