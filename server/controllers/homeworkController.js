import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import HomeworkService from '../services/homeworkService.js';
import { homeworkEmailAttachment } from '../utils/emailTmplt.js';
import SendEmail from '../middlewares/sendEmail.js';
import Common from '../models/common.js';
const fs = require('fs');;
const path = require('path');;

export default class HomeworkController {
  //////////////////////////////////////////
  async createHomework(req, res) {
    const data = req.body;

    if (!data.homework_title || !data.tenant_id) {
      res.status(400).json({ message: 'Missing mandatory fields: homework_title, tenant_id' });
      return;
    }

    // Handle file upload (file is always present due to route validation)
    data.homework_filename = req.file.originalname;
    data.homework_file_path = req.file.path; // Store the local file path
    data.file_size = req.file.size;
    data.file_type = req.file.mimetype;

    const homework = new HomeworkService();
    const rec = await homework.createHomework(data);

    if (rec.error) {
      // If homework creation failed, delete the uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Error deleting file after failed homework creation:', error);
      }
      res.status(400).json(rec);
      return;
    }

    // Send email to client when homework is successfully uploaded
    if (data.session_id) {
      console.log('📧 Starting email process for session_id:', data.session_id);
      try {
        const common = new Common();
        let clientEmail = null;
        let clientName = null;
        let therapyRequest = null; // Declare at the correct scope

        // Get session information
        console.log('🔍 Getting session information...');
        console.log('Session id---------->:', data.session_id);
        const sessionInfo = await common.getSessionById({session_id: data.session_id});

        console.log('Session info found:', sessionInfo ? sessionInfo.length : 0, 'records');
        
        if (sessionInfo && sessionInfo.length > 0) {
          console.log('✅ Session found, thrpy_req_id:', sessionInfo[0].thrpy_req_id);
          // Get therapy request to find client_id
          console.log('🔍 Getting therapy request...');
          therapyRequest = await common.getThrpyReqById(sessionInfo[0].thrpy_req_id);
          console.log('Therapy request---------->:', therapyRequest);
          console.log('Therapy request found:', therapyRequest ? therapyRequest.length : 0, 'records');
          
          if (therapyRequest && therapyRequest.length > 0) {
            console.log('✅ Therapy request found, client_id:', therapyRequest[0].client_id);
            
            // Get client profile information
            console.log('🔍 Getting client profile...');
            const clientInfo = await common.getUserProfileByUserProfileId(therapyRequest[0].client_id);
            console.log('Client info:', clientInfo);
            console.log('Client info found:', clientInfo ? clientInfo.length : 0, 'records');
            
            if (clientInfo && clientInfo.length > 0) {
              clientName = `${clientInfo[0].user_first_name} ${clientInfo[0].user_last_name}`;
              console.log('✅ Client profile found, name:', clientName, 'user_id:', clientInfo[0].user_id);
              
              // Get client email from users table using user_id
              console.log('🔍 Getting client email...');
              const userInfo = await common.getUserById(clientInfo[0].user_id);
              console.log('User info found:', userInfo ? userInfo.length : 0, 'records');
              
              if (userInfo && userInfo.length > 0) {
                clientEmail = userInfo[0].email;
                console.log('✅ Client email found:', clientEmail);
              } else {
                console.log('❌ User info not found for user_id:', clientInfo[0].user_id);
              }
            } else {
              console.log('❌ Client profile not found for client_id:', therapyRequest[0].client_id);
            }
          } else {
            console.log('❌ Therapy request not found for thrpy_req_id:', sessionInfo[0].thrpy_req_id);
          }
        } else {
          console.log('❌ Session not found for session_id:', data.session_id);
        }

        // Get counselor email for Reply-To
        let counselorEmail = null;
        if (therapyRequest && therapyRequest.length > 0 && therapyRequest[0].counselor_id) {
          console.log('🔍 Getting counselor profile...');
          const counselorInfo = await common.getUserProfileByUserProfileId(therapyRequest[0].counselor_id);
          if (counselorInfo && counselorInfo.length > 0) {
            console.log('✅ Counselor profile found, user_id:', counselorInfo[0].user_id);
            const counselorUserInfo = await common.getUserById(counselorInfo[0].user_id);
            if (counselorUserInfo && counselorUserInfo.length > 0) {
              counselorEmail = counselorUserInfo[0].email;
              console.log('✅ Counselor email found:', counselorEmail);
            }
          }
        }

        // Send email if client email is found
        if (clientEmail) {
          console.log('📤 Preparing to send email to:', clientEmail);
          
          // Read the file from disk for email attachment
          console.log('📄 Reading file from path:', req.file.path);
          const fileBuffer = fs.readFileSync(req.file.path);
          console.log('📊 File buffer size:', fileBuffer.length);
          
          const emailTempl = homeworkEmailAttachment(
            clientEmail,
            data.homework_title,
            fileBuffer,
            req.file.originalname,
            clientName,
            counselorEmail
          );
          
          console.log('📧 Email template created successfully');
          console.log('Email to:', emailTempl.to);
          console.log('Email subject:', emailTempl.subject);
          console.log('Has attachments:', !!emailTempl.attachments);
          
          const sendEmail = new SendEmail();
          const homeworkEmail = await sendEmail.sendMail(emailTempl);
          
          if (homeworkEmail.error) {
            console.error('❌ Email sending failed:', homeworkEmail.message);
          } else {
            console.log('✅ Homework email sent successfully to client:', clientEmail);
          }
        } else {
          console.log('❌ Client email not found for session_id:', data.session_id);
        }
      } catch (error) {
        console.error('❌ Error sending email to client:', error);
        console.error('Error stack:', error.stack);
        // Don't fail the request if email fails, but log the error
      }
    } else {
      console.log('ℹ️ No session_id provided, skipping email notification');
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////
  async getHomeworkBySessionId(req, res) {
    const { session_id } = req.params;

    if (!session_id) {
      res.status(400).json({ message: 'Session ID is required' });
      return;
    }

    const homework = new HomeworkService();
    const rec = await homework.getHomeworkBySessionId(parseInt(session_id));

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////
  async getHomeworkById(req, res) {
    const { homework_id } = req.params;

    if (!homework_id) {
      res.status(400).json({ message: 'Homework ID is required' });
      return;
    }

    const homework = new HomeworkService();
    const rec = await homework.getHomeworkById(parseInt(homework_id));

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////
  async deleteHomework(req, res) {
    const { homework_id } = req.params;

    if (!homework_id) {
      res.status(400).json({ message: 'Homework ID is required' });
      return;
    }

    // First get the homework to get the file path
    const homework = new HomeworkService();
    const homeworkRec = await homework.getHomeworkById(parseInt(homework_id));

    if (homeworkRec.error) {
      res.status(400).json(homeworkRec);
      return;
    }

    // Delete the homework record
    const rec = await homework.deleteHomework(parseInt(homework_id));

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    // Delete the file if it exists
    if (homeworkRec.homework_file_path && fs.existsSync(homeworkRec.homework_file_path)) {
      try {
        fs.unlinkSync(homeworkRec.homework_file_path);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Don't fail the request if file deletion fails
      }
    }

    res.status(200).json(rec);
  }
}
