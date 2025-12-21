//controllers/counselorActivationController.js

import CounselorActivationService from '../services/counselorActivation.js';
import logger from '../config/winston.js';

export default class CounselorActivationController {
  constructor() {
    this.counselorActivationService = new CounselorActivationService();
  }

  //////////////////////////////////////////

  async activateCounselor(req, res) {
    try {
      const { user_id, role_id, target_id } = req.body;

      if (!user_id) {
        return res.status(400).json({
          message: 'user_id is required',
          error: -1,
        });
      }

      if (!role_id) {
        return res.status(400).json({
          message: 'role_id is required',
          error: -1,
        });
      }

      if (!target_id) {
        return res.status(400).json({
          message: 'target_id is required',
          error: -1,
        });
      }

      // Verify that the requester is a tenant (role_id = 3) or admin (role_id = 4)
      if (role_id !== 3 && role_id !== 4) {
        return res.status(403).json({
          message: 'Only tenants or admins can activate/deactivate users',
          error: -1,
        });
      }

      const result = await this.counselorActivationService.activateUser(
        parseInt(user_id),
        parseInt(role_id),
        parseInt(target_id)
      );

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error in activateCounselor controller:', error);
      return res.status(500).json({
        message: 'Error activating user',
        error: -1,
      });
    }
  }

  //////////////////////////////////////////

  async deactivateCounselor(req, res) {
    try {
      const { user_id, role_id, target_id } = req.body;

      if (!user_id) {
        return res.status(400).json({
          message: 'user_id is required',
          error: -1,
        });
      }

      if (!role_id) {
        return res.status(400).json({
          message: 'role_id is required',
          error: -1,
        });
      }

      if (!target_id) {
        return res.status(400).json({
          message: 'target_id is required',
          error: -1,
        });
      }

      // Verify that the requester is a tenant (role_id = 3) or admin (role_id = 4)
      if (role_id !== 3 && role_id !== 4) {
        return res.status(403).json({
          message: 'Only tenants or admins can activate/deactivate users',
          error: -1,
        });
      }

      const result = await this.counselorActivationService.deactivateUser(
        parseInt(user_id),
        parseInt(role_id),
        parseInt(target_id)
      );

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error in deactivateCounselor controller:', error);
      return res.status(500).json({
        message: 'Error deactivating user',
        error: -1,
      });
    }
  }

  //////////////////////////////////////////

  async getCounselorActivationStatus(req, res) {
    try {
      const { counselor_user_id } = req.query;
      const tenant_id = req.decoded?.tenant_id || req.query.tenant_id;

      if (!counselor_user_id) {
        return res.status(400).json({
          message: 'counselor_user_id is required',
          error: -1,
        });
      }

      if (!tenant_id) {
        return res.status(400).json({
          message: 'tenant_id is required',
          error: -1,
        });
      }

      const result = await this.counselorActivationService.getCounselorActivationStatus(
        parseInt(counselor_user_id),
        parseInt(tenant_id)
      );

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error in getCounselorActivationStatus controller:', error);
      return res.status(500).json({
        message: 'Error getting counselor activation status',
        error: -1,
      });
    }
  }

  //////////////////////////////////////////

  async getCounselorsByTenant(req, res) {
    try {
      const tenant_id = req.decoded?.tenant_id || req.query.tenant_id;

      if (!tenant_id) {
        return res.status(400).json({
          message: 'tenant_id is required',
          error: -1,
        });
      }

      const result = await this.counselorActivationService.getCounselorsByTenant(
        parseInt(tenant_id)
      );

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error in getCounselorsByTenant controller:', error);
      return res.status(500).json({
        message: 'Error getting counselors by tenant',
        error: -1,
      });
    }
  }
}

