import { Router } from 'express';
import CounselorDocumentsController from '../controllers/counselorDocuments.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';
import multer from 'multer';
import path from 'path';

const router = Router();
const counselorDocumentsController = new CounselorDocumentsController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/counselor-documents/');
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
router.post('/', authenticate, upload.single('document'), AsyncWrapper(counselorDocumentsController.uploadDocument));
router.get('/:counselor_profile_id', authenticate, AsyncWrapper(counselorDocumentsController.getDocuments));
router.put('/:document_id', authenticate, AsyncWrapper(counselorDocumentsController.updateDocument));
router.delete('/:document_id', authenticate, AsyncWrapper(counselorDocumentsController.deleteDocument));

export const counselorDocumentsRouter = { baseUrl: '/api/counselor-documents', router }; 