import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import FeeSplitManagementController from '../controllers/feeSplitManagementController.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import { authenticate  } from '../middlewares/token.js';

const router = Router();
const feeSplitManagementController = new FeeSplitManagementController();

// Get fee split configuration (tenant-wide or counselor-specific)
router.get('/configuration', authenticate, AsyncWrapper(feeSplitManagementController.getFeeSplitConfiguration.bind(feeSplitManagementController)));

// Create fee split configuration (tenant-wide or counselor-specific)
router.post('/configuration', authenticate, AsyncWrapper(feeSplitManagementController.createFeeSplitConfiguration.bind(feeSplitManagementController)));

// Update fee split configuration (tenant-wide or counselor-specific)
router.put('/configuration', authenticate, AsyncWrapper(feeSplitManagementController.updateFeeSplitConfiguration.bind(feeSplitManagementController)));

// Check if fee split is enabled (tenant-wide or counselor-specific)
router.get('/enabled', authenticate, AsyncWrapper(feeSplitManagementController.isFeeSplitEnabled.bind(feeSplitManagementController)));

// Get fee split percentages (tenant-wide or counselor-specific)
router.get('/percentages', authenticate, AsyncWrapper(feeSplitManagementController.getFeeSplitPercentages.bind(feeSplitManagementController)));

// Validate fee split configuration
router.post('/validate', authenticate, AsyncWrapper(feeSplitManagementController.validateFeeSplitConfiguration.bind(feeSplitManagementController)));

// Get all fee split configurations (admin only)
router.get('/all', authenticate, AsyncWrapper(feeSplitManagementController.getAllFeeSplitConfigurations.bind(feeSplitManagementController)));

// Get counselor-specific configurations for a tenant
router.get('/counselor-configurations', authenticate, AsyncWrapper(feeSplitManagementController.getCounselorSpecificConfigurations.bind(feeSplitManagementController)));

// Get counselors by tenant
router.get('/counselors', authenticate, AsyncWrapper(feeSplitManagementController.getCounselorsByTenant.bind(feeSplitManagementController)));

// Delete fee split configuration (tenant-wide or counselor-specific)
router.delete('/configuration/:tenant_id/:counselor_user_id?', authenticate, AsyncWrapper(feeSplitManagementController.deleteFeeSplitConfiguration.bind(feeSplitManagementController)));

export const feeSplitManagementRouter = { baseUrl: '/api/fee-split-management', router }; 