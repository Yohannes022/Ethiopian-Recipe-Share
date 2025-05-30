import Stripe from 'stripe';
import { Types } from 'mongoose';
import { ApiError } from '../utils/api-error';
import { IUser } from '../interfaces/user.interface';
import { Order } from '../models/Order';

interface PaymentIntentData {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  customer?: string;
  payment_method_types?: string[];
  receipt_email?: string;
}

export class PaymentService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16', // Use the latest API version
    });
  }

  /**
   * Create a new Stripe customer
   */
  async createCustomer(user: IUser): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new ApiError(500, 'Failed to create customer');
    }
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    orderId: Types.ObjectId,
    amount: number,
    user: IUser,
    metadata: Record<string, string> = {}
  ) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd', // or your preferred currency
        metadata: {
          orderId: orderId.toString(),
          userId: user._id.toString(),
          ...metadata,
        },
      });

      // Update order with payment intent
      order.paymentIntentId = paymentIntent.id;
      await order.save();

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new ApiError(500, 'Failed to create payment intent');
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new ApiError(400, 'Invalid webhook signature');
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      // Add more event handlers as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    const order = await Order.findById(orderId);
    if (!order) return;

    // Update order status to 'paid' or 'completed'
    order.status = 'paid';
    order.paymentStatus = 'succeeded';
    order.paymentDetails = {
      paymentMethod: paymentIntent.payment_method as string,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back to dollars
      currency: paymentIntent.currency,
      receiptUrl: (paymentIntent as any).charges?.data[0]?.receipt_url,
    };

    await order.save();

    // TODO: Send order confirmation email
    // await sendOrderConfirmationEmail(order);
  }


  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    const order = await Order.findById(orderId);
    if (!order) return;

    // Update order status to reflect payment failure
    order.paymentStatus = 'failed';
    order.status = 'payment_failed';
    
    if (paymentIntent.last_payment_error) {
      order.paymentError = {
        code: paymentIntent.last_payment_error.code || 'unknown',
        message: paymentIntent.last_payment_error.message || 'Payment failed',
        type: paymentIntent.last_payment_error.type || 'api_error',
      };
    }

    await order.save();

    // TODO: Send payment failed notification
    // await sendPaymentFailedEmail(order);
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentIntentId: string, amount?: number) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(amount && { amount: Math.round(amount * 100) }),
      });

      // Update order status to reflect refund
      if (refund.status === 'succeeded') {
        const order = await Order.findOne({ paymentIntentId });
        if (order) {
          order.status = 'refunded';
          order.refundDetails = {
            refundId: refund.id,
            amount: refund.amount / 100,
            currency: refund.currency,
            reason: refund.reason || 'requested_by_customer',
            status: refund.status,
          };
          await order.save();
        }
      }

      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new ApiError(500, 'Failed to process refund');
    }
  }
}

export const paymentService = new PaymentService();