import SendEmail from '../middlewares/sendEmail.js';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('Email From:', process.env.EMAIL_FROM);
    console.log('Email Password:', process.env.EMAIL_PASSWORD ? '***SET***' : '***NOT SET***');
    
    const sendEmail = new SendEmail();
    
    // Test email configuration
    console.log('Verifying email transporter...');
    await sendEmail.transporter.verify();
    console.log('✅ Email transporter verified successfully!');
    
    // Test sending a simple email
    console.log('Sending test email...');
    const testMsg = {
      to: process.env.EMAIL_FROM, // Send to yourself for testing
      subject: 'Test Email from MindBridge',
      html: '<h1>Test Email</h1><p>This is a test email to verify the email configuration.</p>'
    };
    
    const result = await sendEmail.sendMail(testMsg);
    console.log('Email result:', result);
    
    if (result.error) {
      console.log('❌ Email test failed:', result.message);
    } else {
      console.log('✅ Email test successful!');
    }
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
  }
}

testEmail();
