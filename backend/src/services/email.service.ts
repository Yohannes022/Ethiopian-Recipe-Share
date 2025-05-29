import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import path from 'path';
import { ApiError } from '../utils/apiError';

// Email templates path
const emailTemplatesPath = path.join(__dirname, '../../views/emails');

// Email service class
class EmailService {
  private to: string;
  private firstName: string;
  private from: string;
  private url: string;

  constructor(user: { email: string; name: string }, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;
  }

  /**
   * Create a new Nodemailer transporter
   */
  private newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Use SendGrid for production
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // Use Mailtrap for development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Send the actual email
   */
  private async send(template: string, subject: string, templateVars: any = {}) {
    try {
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(
        `${emailTemplatesPath}/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject,
          ...templateVars,
        }
      );

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: convert(html, {
          wordwrap: 120,
        }),
      };

      // 3) Create a transport and send email
      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new ApiError(500, 'There was an error sending the email. Try again later.');
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Ethiopian Recipe Share!');
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)'
    );
  }

  /**
   * Send email verification
   */
  async sendVerification() {
    await this.send(
      'verifyEmail',
      'Verify your email address',
      { verificationUrl: this.url }
    );
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(orderDetails: any) {
    await this.send(
      'orderConfirmation',
      'Your order has been received!',
      { order: orderDetails }
    );
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(orderDetails: any) {
    await this.send(
      'orderStatusUpdate',
      `Order #${orderDetails.orderNumber} Status Update`,
      { order: orderDetails }
    );
  }

  /**
   * Send account verification email
   */
  async sendAccountVerification() {
    await this.send(
      'accountVerification',
      'Please verify your account',
      { verificationUrl: this.url }
    );
  }

  /**
   * Send contact form submission confirmation
   */
  async sendContactConfirmation(contactData: any) {
    await this.send(
      'contactConfirmation',
      'We\'ve received your message',
      { ...contactData }
    );
  }

  /**
   * Send custom email
   */
  async sendCustomEmail(
    subject: string,
    template: string,
    templateVars: any = {}
  ) {
    await this.send(template, subject, templateVars);
  }
}

export default EmailService;
