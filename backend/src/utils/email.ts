import nodemailer from 'nodemailer';
import { promisify } from 'util';
import * as pug from 'pug';
import { convert } from 'html-to-text';
import { AppError } from '../middleware/errorHandler';

// Email class to handle email sending
class Email {
  private to: string;
  private from: string;
  private firstName: string;
  private url: string;

  constructor(user: { email: string; firstName: string }, url: string) {
    this.to = user.email;
    this.firstName = user.firstName.split(' ')[0];
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;
  }

  // Create a new Nodemailer transporter
  private newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Use SendGrid for production
      return nodemailer.createTransport({
        service: 'SendGrid', // No need to set host or port
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

  // Send the actual email
  private async send(template: string, subject: string, templateVars: any = {}) {
    try {
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(
        `${__dirname}/../views/emails/${template}.pug`,
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
        text: convert(html),
      };

      // 3) Create a transport and send email
      const transporter = this.newTransport();
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new AppError('There was an error sending the email. Please try again later!', 500);
    }
  }

  // Send welcome email
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Ethiopian Recipe Share!');
  }

  // Send password reset token
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)',
      { resetUrl: this.url }
    );
  }

  // Send email verification token
  async sendVerificationToken() {
    await this.send(
      'verifyEmail',
      'Verify your email address',
      { verificationUrl: this.url }
    );
  }
}

// Export a function that creates and sends an email
export const sendEmail = async (
  user: { email: string; firstName: string },
  url: string,
  type: 'welcome' | 'passwordReset' | 'verifyEmail'
) => {
  try {
    const email = new Email(user, url);

    switch (type) {
      case 'welcome':
        await email.sendWelcome();
        break;
      case 'passwordReset':
        await email.sendPasswordReset();
        break;
      case 'verifyEmail':
        await email.sendVerificationToken();
        break;
      default:
        throw new Error('Invalid email type');
    }
  } catch (error) {
    console.error('Error in sendEmail function:', error);
    throw error;
  }
};

// Export the Email class for direct usage if needed
export default Email;
