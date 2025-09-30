/**
 * Email Service
 * Handles email sending for verification, password reset, etc.
 */

const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Create email transporter
 */
const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.secure,
  auth: config.email.smtp.auth.user ? {
    user: config.email.smtp.auth.user,
    pass: config.email.smtp.auth.pass,
  } : undefined,
});

/**
 * Verify email configuration
 */
async function verifyConnection() {
  try {
    await transporter.verify();
    logger.info('Email service is ready');
    return true;
  } catch (error) {
    logger.error('Email service verification failed:', error);
    return false;
  }
}

/**
 * Send email
 * @param {Object} options - Email options
 */
async function sendEmail(options) {
  try {
    const mailOptions = {
      from: `${config.email.fromName} <${config.email.from}>`,
      ...options,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 */
async function sendVerificationEmail(email, token) {
  const verificationUrl = `${config.cors.origin[0]}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Thank you for registering with WhatsApp API Platform!</p>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" class="button">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} WhatsApp API Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - WhatsApp API Platform',
    html,
  });
}

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 */
async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${config.cors.origin[0]}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>You requested to reset your password for WhatsApp API Platform.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} WhatsApp API Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - WhatsApp API Platform',
    html,
  });
}

/**
 * Send welcome email
 * @param {string} email - Recipient email
 * @param {string} name - User name
 */
async function sendWelcomeEmail(email, name) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to WhatsApp API Platform!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Welcome to WhatsApp API Platform! We're excited to have you on board.</p>
          <p>Here are some resources to get you started:</p>
          <ul>
            <li><a href="${config.cors.origin[0]}/docs">API Documentation</a></li>
            <li><a href="${config.cors.origin[0]}/dashboard">Dashboard</a></li>
            <li><a href="${config.cors.origin[0]}/support">Support</a></li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} WhatsApp API Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to WhatsApp API Platform!',
    html,
  });
}

module.exports = {
  verifyConnection,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};

