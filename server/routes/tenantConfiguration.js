import { Router } from 'express';
import TenantConfigurationController from '../controllers/tenantConfigurationController.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const tenantConfigurationController = new TenantConfigurationController();

// Get tenant configuration
router.get('/', authenticate, AsyncWrapper(tenantConfigurationController.getTenantConfiguration.bind(tenantConfigurationController)));

// Update tenant configuration
router.put('/', authenticate, AsyncWrapper(tenantConfigurationController.updateTenantConfiguration.bind(tenantConfigurationController)));

// Check if feature is enabled
router.get('/feature-enabled', authenticate, AsyncWrapper(tenantConfigurationController.isFeatureEnabled.bind(tenantConfigurationController)));

// Get feature value
router.get('/feature-value', authenticate, AsyncWrapper(tenantConfigurationController.getFeatureValue.bind(tenantConfigurationController)));

export const tenantConfigurationRouter = { baseUrl: '/api/tenant-configuration', router }; 