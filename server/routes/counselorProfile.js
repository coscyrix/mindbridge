import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const express = require('express');;
import CounselorProfileController from '../controllers/counselorProfile.js';
import { authenticate } from '../middlewares/token.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
const multer = require('multer');;

const router = express.Router();
const counselorProfileController = new CounselorProfileController();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public endpoints
router.get('/search', AsyncWrapper(counselorProfileController.searchCounselors.bind(counselorProfileController)));
router.get('/search/filters', AsyncWrapper(counselorProfileController.getSearchFilters.bind(counselorProfileController)));

// Protected routes
router.post('/', AsyncWrapper(counselorProfileController.createCounselorProfile.bind(counselorProfileController)));
router.get('/', AsyncWrapper(counselorProfileController.getCounselorProfile.bind(counselorProfileController)));

// Get appointments for logged-in counselor (MUST come before :counselor_profile_id route)
router.get('/appointments',
  authenticate,
  AsyncWrapper(counselorProfileController.getMyAppointments.bind(counselorProfileController))
);

// Get appointment by id (MUST come before :counselor_profile_id route)
router.get('/appointment',
  AsyncWrapper(counselorProfileController.getAppointmentById.bind(counselorProfileController))
);

router.put('/:counselor_profile_id', AsyncWrapper(counselorProfileController.updateCounselorProfile.bind(counselorProfileController)));
router.get('/:counselor_profile_id', AsyncWrapper(counselorProfileController.getCounselorProfile.bind(counselorProfileController)));
router.post('/:counselor_profile_id/reviews', authenticate, AsyncWrapper(counselorProfileController.addReview.bind(counselorProfileController)));
router.get('/:counselor_profile_id/reviews', authenticate, AsyncWrapper(counselorProfileController.getReviews.bind(counselorProfileController)));

// Profile image upload endpoint
router.put('/:counselor_profile_id/image', 
  authenticate, 
  upload.single('image'),
  AsyncWrapper(counselorProfileController.updateProfileImage.bind(counselorProfileController))
);

// License file upload endpoint
router.put('/:counselor_profile_id/license', 
  authenticate, 
  upload.single('license'),
  AsyncWrapper(counselorProfileController.updateLicenseFile.bind(counselorProfileController))
);

// Send appointment email to counselor
router.post('/send-appointment-email',
  AsyncWrapper(counselorProfileController.sendAppointmentEmail.bind(counselorProfileController))
);

// Get appointment email history for a counselor
router.get('/:counselor_profile_id/email-history',
  authenticate,
  AsyncWrapper(counselorProfileController.getAppointmentEmailHistory.bind(counselorProfileController))
);

// Send intake form to client
router.post('/send-intake-form',
  authenticate,
  AsyncWrapper(counselorProfileController.sendIntakeForm.bind(counselorProfileController))
);

export const counselorProfileRouter = { baseUrl: '/api/counselor-profile', router }; 