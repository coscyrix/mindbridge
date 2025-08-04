import HomeworkService from '../services/homeworkService.js';
import { homeworkEmailAttachment } from '../utils/emailTmplt.js';
import SendEmail from '../middlewares/sendEmail.js';
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

    // Handle file upload if present
    if (req.file) {
      data.homework_filename = req.file.originalname;
      data.homework_file_path = req.file.path; // Store the local file path
      data.file_size = req.file.size;
      data.file_type = req.file.mimetype;
    } else {
      data.homework_filename = '';
      data.homework_file_path = '';
      data.file_size = null;
      data.file_type = null;
    }

    const homework = new HomeworkService();
    const rec = await homework.createHomework(data);

    if (rec.error) {
      // If homework creation failed and file was uploaded, delete the file
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (error) {
          console.error('Error deleting file after failed homework creation:', error);
        }
      }
      res.status(400).json(rec);
      return;
    }

    // Send email with the file attachment if email is provided
    if (data.email && req.file) {
      try {
        // Read the file from disk for email attachment
        const fileBuffer = fs.readFileSync(req.file.path);
        const emailTempl = homeworkEmailAttachment(
          data.email,
          data.homework_title,
          fileBuffer,
          req.file.originalname
        );
        const sendEmail = new SendEmail();
        const homeworkEmail = await sendEmail.sendMail(emailTempl);
      } catch (error) {
        console.error('Error sending email with attachment:', error);
        // Don't fail the request if email fails
      }
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
