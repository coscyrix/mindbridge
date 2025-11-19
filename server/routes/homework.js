import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import HomeworkController from '../controllers/homeworkController.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import { authenticate  } from '../middlewares/token.js';
const multer = require('multer');;
const path = require('path');;
const fs = require('fs');;

const router = Router();
const homeworkController = new HomeworkController();

// Configure multer for homework file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/homework/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG, DOC, and DOCX files are allowed.'));
    }
  }
});

// Create homework with file upload (file is required)
router.post(
  '/',
  authenticate,
  upload.single('homework_file'),
  (req, res, next) => {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Homework file is required. Please upload a file.' 
      });
    }
    next();
  },
  AsyncWrapper(homeworkController.createHomework),
);

// Get homework by session ID
router.get(
  '/session/:session_id',
  authenticate,
  AsyncWrapper(homeworkController.getHomeworkBySessionId),
);

// Get homework by ID
router.get(
  '/:homework_id',
  authenticate,
  AsyncWrapper(homeworkController.getHomeworkById),
);

// Delete homework
router.delete(
  '/:homework_id',
  authenticate,
  AsyncWrapper(homeworkController.deleteHomework),
);

export const homeWorkRouter = { baseUrl: '/api/homework', router };
