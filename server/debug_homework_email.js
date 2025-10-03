// Debug script to test homework email flow step by step
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Common from './models/common.js';
import SendEmail from './middlewares/sendEmail.js';
import { homeworkEmailAttachment } from './utils/emailTmplt.js';
const fs = require('fs');;
const path = require('path');;

async function debugHomeworkEmail() {
  try {
    console.log('🔍 Debugging homework email flow...');
    
    // Test with a specific session_id (you'll need to replace this with a real session_id)
    const testSessionId = 662; // This is the session_id from the client code
    
    console.log('📋 Testing with session_id:', testSessionId);
    
    const common = new Common();
    let clientEmail = null;
    let clientName = null;
    
    // Step 1: Get session information
    console.log('\n1️⃣ Getting session information...');
    const sessionInfo = await common.getSessionById(testSessionId);
    console.log('Session info:', sessionInfo);
    
    if (sessionInfo && sessionInfo.length > 0) {
      console.log('✅ Session found');
      console.log('thrpy_req_id:', sessionInfo[0].thrpy_req_id);
      
      // Step 2: Get therapy request
      console.log('\n2️⃣ Getting therapy request...');
      const therapyRequest = await common.getThrpyReqById(sessionInfo[0].thrpy_req_id);
      console.log('Therapy request:', therapyRequest);
      
      if (therapyRequest && therapyRequest.length > 0) {
        console.log('✅ Therapy request found');
        console.log('client_id:', therapyRequest[0].client_id);
        
        // Step 3: Get client profile information
        console.log('\n3️⃣ Getting client profile...');
        const clientInfo = await common.getUserProfileByUserProfileId(therapyRequest[0].client_id);
        console.log('Client info:', clientInfo);
        
        if (clientInfo && clientInfo.length > 0) {
          console.log('✅ Client profile found');
          clientName = `${clientInfo[0].user_first_name} ${clientInfo[0].user_last_name}`;
          console.log('Client name:', clientName);
          console.log('user_id:', clientInfo[0].user_id);
          
          // Step 4: Get client email
          console.log('\n4️⃣ Getting client email...');
          const userInfo = await common.getUserById(clientInfo[0].user_id);
          console.log('User info:', userInfo);
          
          if (userInfo && userInfo.length > 0) {
            console.log('✅ User info found');
            clientEmail = userInfo[0].email;
            console.log('Client email:', clientEmail);
          } else {
            console.log('❌ User info not found');
          }
        } else {
          console.log('❌ Client profile not found');
        }
      } else {
        console.log('❌ Therapy request not found');
      }
    } else {
      console.log('❌ Session not found');
    }
    
    // Step 5: Test email sending if we have client email
    if (clientEmail) {
      console.log('\n5️⃣ Testing email sending...');
      
      // Create a test file
      const testFilePath = path.join(process.cwd(), 'debug_test_homework.txt');
      const testContent = 'This is a debug test homework file.';
      fs.writeFileSync(testFilePath, testContent);
      
      try {
        // Read the test file
        const fileBuffer = fs.readFileSync(testFilePath);
        console.log('File buffer size:', fileBuffer.length);
        
        // Create email template
        const emailTempl = homeworkEmailAttachment(
          clientEmail,
          'Debug Test Homework Assignment',
          fileBuffer,
          'debug_test_homework.txt',
          clientName
        );
        
        console.log('Email template created successfully');
        console.log('To:', emailTempl.to);
        console.log('Subject:', emailTempl.subject);
        console.log('Has attachments:', !!emailTempl.attachments);
        
        // Send email
        const sendEmail = new SendEmail();
        const result = await sendEmail.sendMail(emailTempl);
        
        console.log('Email send result:', result);
        
        if (result.error) {
          console.log('❌ Email sending failed:', result.message);
        } else {
          console.log('✅ Email sent successfully!');
        }
        
        // Clean up
        fs.unlinkSync(testFilePath);
        
      } catch (emailError) {
        console.error('❌ Error in email sending:', emailError);
      }
    } else {
      console.log('❌ No client email found, skipping email test');
    }
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

// Run the debug
debugHomeworkEmail();
