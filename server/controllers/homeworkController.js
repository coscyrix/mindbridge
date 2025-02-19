import HomeworkService from '../services/homeworkService.js';
import { homeworkEmailAttachment } from '../utils/emailTmplt.js';
import SendEmail from '../middlewares/sendEmail.js';

export default class HomeworkController {
  //////////////////////////////////////////
  async createHomework(req, res) {
    const data = req.body;

    if (!data.email) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    // If files array exists, pick the file with fieldname 'homework_file' if available
    if (req.files && req.files.length > 0) {
      req.file =
        req.files.find((f) => f.fieldname === 'homework_file') || req.files[0];
      data.homework_filename = req.file.originalname;
    } else {
      data.homework_filename = '';
    }

    const homework = new HomeworkService();
    const rec = await homework.createHomework(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    // Send email with the file attachment without saving the file
    // Assumes data.email contains recipient email
    if (req.file) {
      const emailTempl = homeworkEmailAttachment(
        data.email,
        data.homework_title,
        req.file.buffer,
        req.file.originalname // change: pass original filename
      );
      const sendEmail = new SendEmail();
      const homeworkEmail = await sendEmail.sendMail(emailTempl);
    }

    res.status(200).json(rec);
  }
}
