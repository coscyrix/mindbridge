import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../config/winston.js';
import e from 'express';

dotenv.config();

export default class SendEmail {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_FROM, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your App Password (without spaces)
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendMail(msg) {
    try {
      // Log email configuration for debugging
      logger.info('Email configuration:', {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: process.env.EMAIL_FROM ? `${process.env.EMAIL_FROM.substring(0, 3)}***` : 'NOT_SET',
        hasPassword: !!process.env.EMAIL_PASSWORD
      });

      // Verify connection configuration
      logger.info('Verifying email connection...');
      await this.transporter.verify();
      logger.info('Email connection verified successfully');
      
      const info = await this.transporter.sendMail({
        from: `"MindBridge" <${process.env.EMAIL_FROM}>`, // Sender's address and name
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        attachments: msg.attachments, // Ensure attachments are included
      });

      if (!info.messageId) {
        logger.error('Error sending email: No message ID returned');
        return { message: 'Error sending email', error: -1 };
      }

      logger.info('Message sent successfully: %s', info.messageId);

      return { message: 'Email sent successfully' };
    } catch (error) {
      logger.error('Error sending email:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send email';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Email service connection refused. Please check your email configuration and network settings.';
      } else if (error.code === 'EAUTH') {
        errorMessage = 'Email authentication failed. Please check your email credentials and App Password.';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Email service connection timed out. Please check your network connection.';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Email server not found. Please check your internet connection.';
      }
      
      return { message: errorMessage, error: -1 };
    }
  }
}
