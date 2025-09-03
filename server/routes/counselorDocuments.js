import { Router } from 'express';
import CounselorDocumentsController from '../controllers/counselorDocuments.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const counselorDocumentsController = new CounselorDocumentsController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/counselor-documents/';
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
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG and PNG files are allowed.'));
    }
  }
});

// Routes
router.post('/', authenticate, upload.single('document'), AsyncWrapper(counselorDocumentsController.addDocument.bind(counselorDocumentsController)));
router.get('/:counselor_profile_id', authenticate, AsyncWrapper(counselorDocumentsController.getDocuments.bind(counselorDocumentsController)));
router.put('/:document_id', authenticate, AsyncWrapper(counselorDocumentsController.updateDocument.bind(counselorDocumentsController)));
router.delete('/:document_id', authenticate, AsyncWrapper(counselorDocumentsController.deleteDocument.bind(counselorDocumentsController)));

export const counselorDocumentsRouter = { baseUrl: '/api/counselor-documents', router }; 