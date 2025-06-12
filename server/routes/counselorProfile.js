import express from 'express';
import CounselorProfileController from '../controllers/counselorProfile.js';
import { authenticate } from '../middlewares/token.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import multer from 'multer';

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
router.put('/:counselor_profile_id', AsyncWrapper(counselorProfileController.updateCounselorProfile.bind(counselorProfileController)));
router.get('/', AsyncWrapper(counselorProfileController.getCounselorProfile.bind(counselorProfileController)));
router.get('/:counselor_profile_id', AsyncWrapper(counselorProfileController.getCounselorProfile.bind(counselorProfileController)));
router.post('/:counselor_profile_id/reviews', authenticate, AsyncWrapper(counselorProfileController.addReview.bind(counselorProfileController)));
router.get('/:counselor_profile_id/reviews', authenticate, AsyncWrapper(counselorProfileController.getReviews.bind(counselorProfileController)));

// Profile image upload endpoint
router.put('/:counselor_profile_id/image', 
  authenticate, 
  upload.single('image'),
  AsyncWrapper(counselorProfileController.updateProfileImage.bind(counselorProfileController))
);

export const counselorProfileRouter = { baseUrl: '/api/counselor-profile', router }; 