import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const TreatmentTargetFeedbackConfig = require('../models/treatmentTargetFeedbackConfig.js').default;
const logger = require('../config/winston.js').default;

export default class TreatmentTargetFeedbackConfigController {
  //////////////////////////////////////////
  constructor() {
    this.treatmentTargetFeedbackConfig = new TreatmentTargetFeedbackConfig();
  }
  //////////////////////////////////////////

  /**
   * Create a new treatment target feedback configuration
   * POST /api/treatment-target-feedback-config
   */
  async postTreatmentTargetFeedbackConfig(req, res) {
    try {
      const { treatment_target, form_name, service_name, purpose, sessions, tenant_id } = req.body;

      // Validate required fields
      if (!treatment_target || !form_name || !sessions) {
        return res.status(400).json({
          message: 'Missing required fields: treatment_target, form_name, sessions',
          error: -1
        });
      }

      // Validate sessions is an array
      if (!Array.isArray(sessions)) {
        return res.status(400).json({
          message: 'Sessions must be an array',
          error: -1
        });
      }

      const result = await this.treatmentTargetFeedbackConfig.postTreatmentTargetFeedbackConfig({
        treatment_target,
        form_name,
        service_name,
        purpose,
        sessions,
        tenant_id
      });

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target feedback configuration by ID
   * PUT /api/treatment-target-feedback-config/:id
   */
  async putTreatmentTargetFeedbackConfigById(req, res) {
    try {
      const { id } = req.params;
      const { treatment_target, form_name, service_name, purpose, sessions, tenant_id } = req.body;

      // Validate required fields
      if (!treatment_target || !form_name || !sessions) {
        return res.status(400).json({
          message: 'Missing required fields: treatment_target, form_name, sessions',
          error: -1
        });
      }

      // Validate sessions is an array
      if (!Array.isArray(sessions)) {
        return res.status(400).json({
          message: 'Sessions must be an array',
          error: -1
        });
      }

      const result = await this.treatmentTargetFeedbackConfig.putTreatmentTargetFeedbackConfigById({
        id: parseInt(id),
        treatment_target,
        form_name,
        service_name,
        purpose,
        sessions,
        tenant_id
      });

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target feedback configuration by ID
   * GET /api/treatment-target-feedback-config/:id
   */
  async getTreatmentTargetFeedbackConfigById(req, res) {
    try {
      const { id } = req.params;

      const result = await this.treatmentTargetFeedbackConfig.getTreatmentTargetFeedbackConfigById({
        id: parseInt(id)
      });

      if (result.error) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Get all treatment target feedback configurations with optional filters
   * GET /api/treatment-target-feedback-config
   */
  async getTreatmentTargetFeedbackConfigs(req, res) {
    try {
      const { treatment_target, form_name, service_name, tenant_id } = req.query;

      const result = await this.treatmentTargetFeedbackConfig.getTreatmentTargetFeedbackConfigs({
        treatment_target,
        form_name,
        service_name: service_name === 'null' ? null : service_name,
        tenant_id: tenant_id ? parseInt(tenant_id) : undefined
      });

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.log('error-------->', error);
      
      logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Check if a session should trigger feedback forms for a treatment target
   * POST /api/treatment-target-feedback-config/check-session
   */
  async checkSessionFeedbackForms(req, res) {
    try {
      const { treatment_target, session_number, tenant_id } = req.body;

      // Validate required fields
      if (!treatment_target || !session_number) {
        return res.status(400).json({
          message: 'Missing required fields: treatment_target, session_number',
          error: -1
        });
      }

      // Validate session_number is a number
      if (typeof session_number !== 'number' || session_number < 1) {
        return res.status(400).json({
          message: 'session_number must be a positive number',
          error: -1
        });
      }

      const result = await this.treatmentTargetFeedbackConfig.checkSessionFeedbackForms({
        treatment_target,
        session_number,
        tenant_id: tenant_id ? parseInt(tenant_id) : undefined
      });

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Delete treatment target feedback configuration by ID
   * DELETE /api/treatment-target-feedback-config/:id
   */
  async deleteTreatmentTargetFeedbackConfigById(req, res) {
    try {
      const { id } = req.params;

      const result = await this.treatmentTargetFeedbackConfig.deleteTreatmentTargetFeedbackConfigById({
        id: parseInt(id)
      });

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Get all unique treatment targets
   * GET /api/treatment-target-feedback-config/treatment-targets
   */
  async getTreatmentTargets(req, res) {
    try {
      const result = await this.treatmentTargetFeedbackConfig.getTreatmentTargets();

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Get all unique form names
   * GET /api/treatment-target-feedback-config/form-names
   */
  async getFormNames(req, res) {
    try {
      const result = await this.treatmentTargetFeedbackConfig.getFormNames();

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Bulk create treatment target feedback configurations
   * POST /api/treatment-target-feedback-config/bulk
   */
  async bulkCreateTreatmentTargetFeedbackConfigs(req, res) {
    try {
      const { configs } = req.body;

      // Validate configs is an array
      if (!Array.isArray(configs)) {
        return res.status(400).json({
          message: 'Configs must be an array',
          error: -1
        });
      }

      const results = [];
      const errors = [];

      for (const config of configs) {
        const { treatment_target, form_name, purpose, sessions, tenant_id } = config;

        // Validate required fields
        if (!treatment_target || !form_name || !sessions) {
          errors.push({
            config,
            error: 'Missing required fields: treatment_target, form_name, sessions'
          });
          continue;
        }

        // Validate sessions is an array
        if (!Array.isArray(sessions)) {
          errors.push({
            config,
            error: 'Sessions must be an array'
          });
          continue;
        }

        const result = await this.treatmentTargetFeedbackConfig.postTreatmentTargetFeedbackConfig({
          treatment_target,
          form_name,
          purpose,
          sessions,
          tenant_id
        });

        if (result.error) {
          errors.push({
            config,
            error: result.message
          });
        } else {
          results.push(result);
        }
      }

      return res.status(200).json({
        message: 'Bulk create completed',
        successful: results.length,
        failed: errors.length,
        results,
        errors
      });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Get all unique service names
   * GET /api/treatment-target-feedback-config/service-names/list
   */
  async getServiceNames(req, res) {
    try {
      const result = await this.treatmentTargetFeedbackConfig.getServiceNames();

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Load session forms based on treatment target
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async loadSessionFormsByTreatmentTarget(req, res) {
    try {
      const data = req.body;
      
      // Get tenant ID from user context
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: data.counselor_id || req.user?.user_profile_id,
      });
      data.tenant_id = Number(tenantId[0]?.tenant_id);

      const treatmentTargetFeedbackConfigService = new TreatmentTargetFeedbackConfigService();
      const result = await treatmentTargetFeedbackConfigService.loadSessionFormsByTreatmentTarget(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////
} 