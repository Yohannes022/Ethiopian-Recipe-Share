"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const pug_1 = __importDefault(require("pug"));
const html_to_text_1 = require("html-to-text");
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
// Create a test account for development
const createTestAccount = async () => {
    const testAccount = await nodemailer_1.default.createTestAccount();
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
        return nodemailer_1.default.createTransport({
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
    logger_1.default.info(`Test account created: ${account.auth.user}`);
    return nodemailer_1.default.createTransport({
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
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Ethiopian Recipe Share <${process.env.EMAIL_FROM || 'noreply@ethiopianrecipes.com'}>`;
    }
    // Initialize transporter
    async initTransporter() {
        if (!this.transporter) {
            this.transporter = await createTransporter();
        }
        return this.transporter;
    }
    // Send the actual email
    async send(template, subject, templateVars = {}) {
        try {
            await this.initTransporter();
            // 1) Render HTML based on a pug template
            const html = pug_1.default.renderFile(path_1.default.join(__dirname, `../views/emails/${template}.pug`), {
                firstName: this.firstName,
                url: this.url,
                subject,
                ...templateVars,
            });
            // 2) Define email options
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
                text: (0, html_to_text_1.convert)(html, {
                    wordwrap: 130,
                }),
            };
            // 3) Create a transport and send email
            const info = await this.transporter.sendMail(mailOptions);
            // Log preview URL in development
            if (process.env.NODE_ENV !== 'production') {
                logger_1.default.info(`Preview URL: ${nodemailer_1.default.getTestMessageUrl(info)}`);
            }
            return info;
        }
        catch (error) {
            logger_1.default.error(`Error sending email: ${error}`);
            throw error;
        }
    }
    // Send welcome email
    async sendWelcome() {
        await this.send('welcome', 'Welcome to Ethiopian Recipe Share!', { subject: 'Welcome to Ethiopian Recipe Share!' });
    }
    // Send password reset email
    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for 10 minutes)', { subject: 'Password Reset' });
    }
    // Send email verification
    async sendEmailVerification() {
        await this.send('verifyEmail', 'Verify your email address', { subject: 'Verify Your Email' });
    }
    // Send notification
    async sendNotification(notification) {
        await this.send('notification', notification.title, { message: notification.message });
    }
}
exports.default = Email;
