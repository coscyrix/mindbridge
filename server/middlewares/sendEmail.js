import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../config/winston.js';
import e from 'express';

dotenv.config();

export default class SendEmail {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your App Password (without spaces)
      },
    });
  }

  async sendMail(msg) {
    try {
      const info = await this.transporter.sendMail({
        from: `"MindBridge" <${process.env.EMAIL_FROM}>`, // Sender's address and name
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        attachments: msg.attachments, // Ensure attachments are included
      });

      if (!info.messageId) {
        logger.error('Error sending email');
        return { message: 'Error sending email', error: -1 };
      }

      logger.info('Message sent: %s', info.messageId);

      return { message: 'Email sent successfully' };
    } catch (error) {
      logger.error('Error sending email:', error);
    }
  }
}
