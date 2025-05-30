import nodemailer from 'nodemailer';
import { IUser } from '@/types/user.types';
import pug from 'pug';
import { convert } from 'html-to-text';
import path from 'path';
import logger from './logger';

// Create a test account for development
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  };
};

// Create transporter based on environment
const createTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // For development, use ethereal.email
  const account = await createTestAccount();
  logger.info(`Test account created: ${account.auth.user}`);
  
  return nodemailer.createTransport({
    host: account.host,
    port: account.port,
    secure: account.secure,
    auth: {
      user: account.auth.user,
      pass: account.auth.pass,
    },
  });
};

class Email {
  private to: string;
  private firstName: string;
  private from: string;
  private url: string;
  private transporter: any;

  constructor(user: IUser, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ethiopian Recipe Share <${process.env.EMAIL_FROM || 'noreply@ethiopianrecipes.com'}>`;
  }

  // Initialize transporter
  private async initTransporter() {
    if (!this.transporter) {
      this.transporter = await createTransporter();
    }
    return this.transporter;
  }

  // Send the actual email
  private async send(template: string, subject: string, templateVars: Record<string, any> = {}) {
    try {
      await this.initTransporter();
      
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(
        path.join(__dirname, `../views/emails/${template}.pug`),
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
          wordwrap: 130,
        }),
      };

      // 3) Create a transport and send email
      const info = await this.transporter.sendMail(mailOptions);

      // Log preview URL in development
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return info;
    } catch (error) {
      logger.error(`Error sending email: ${error}`);
      throw error;
    }
  }

  // Send welcome email
  async sendWelcome() {
    await this.send(
      'welcome',
      'Welcome to Ethiopian Recipe Share!',
      { subject: 'Welcome to Ethiopian Recipe Share!' }
    );
  }

  // Send password reset email
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)',
      { subject: 'Password Reset' }
    );
  }

  // Send email verification
  async sendEmailVerification() {
    await this.send(
      'verifyEmail',
      'Verify your email address',
      { subject: 'Verify Your Email' }
    );
  }

  // Send notification
  async sendNotification(notification: { title: string; message: string }) {
    await this.send(
      'notification',
      notification.title,
      { message: notification.message }
    );
  }
}

export default Email;
