import HomeworkService from '../services/homeworkService.js';
import { homeworkEmailAttachment } from '../utils/emailTmplt.js';
import SendEmail from '../middlewares/sendEmail.js';
import Common from '../models/common.js';
import fs from 'fs';
import path from 'path';

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
      try {
        const common = new Common();
        let clientEmail = null;
        let clientName = null;

        // Get session information
        const sessionInfo = await common.getSessionById(data.session_id);
        if (sessionInfo && sessionInfo.length > 0) {
          // Get therapy request to find client_id
          const therapyRequest = await common.getThrpyReqById(sessionInfo[0].thrpy_req_id);
          if (therapyRequest && therapyRequest.length > 0) {
            // Get client profile information
            const clientInfo = await common.getUserProfileByUserProfileId(therapyRequest[0].client_id);
            if (clientInfo && clientInfo.length > 0) {
              clientName = `${clientInfo[0].user_first_name} ${clientInfo[0].user_last_name}`;
              
              // Get client email from users table using user_id
              const userInfo = await common.getUserById(clientInfo[0].user_id);
              if (userInfo && userInfo.length > 0) {
                clientEmail = userInfo[0].email;
              }
            }
          }
        }

        // Send email if client email is found
        if (clientEmail) {
          // Read the file from disk for email attachment
          const fileBuffer = fs.readFileSync(req.file.path);
          const emailTempl = homeworkEmailAttachment(
            clientEmail,
            data.homework_title,
            fileBuffer,
            req.file.originalname,
            clientName
          );
          const sendEmail = new SendEmail();
          const homeworkEmail = await sendEmail.sendMail(emailTempl);
          
          console.log('Homework email sent successfully to client:', clientEmail);
        } else {
          console.log('Client email not found for session_id:', data.session_id);
        }
      } catch (error) {
        console.error('Error sending email to client:', error);
        // Don't fail the request if email fails, but log the error
      }
    } else {
      console.log('No session_id provided, skipping email notification');
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
