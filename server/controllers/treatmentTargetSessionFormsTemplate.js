import TreatmentTargetSessionFormsTemplateService from '../services/treatmentTargetSessionFormsTemplate.js';

export default class TreatmentTargetSessionFormsTemplateController {
  //////////////////////////////////////////

  constructor() {
    this.treatmentTargetSessionFormsTemplateService = new TreatmentTargetSessionFormsTemplateService();
  }

  //////////////////////////////////////////

  /**
   * Get all template configurations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTemplateConfigurations(req, res) {
    try {
      const result = await this.treatmentTargetSessionFormsTemplateService.getTemplateConfigurations();

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Copy template configurations to a new tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async copyTemplateConfigurationsToTenant(req, res) {
    try {
      const data = req.body;

      if (!data.tenant_id) {
        res.status(400).json({ message: 'tenant_id is required', error: -1 });
        return;
      }

      const result = await this.treatmentTargetSessionFormsTemplateService.copyTemplateConfigurationsToTenant(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Update existing tenant configurations with latest template configurations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTemplateConfigurationsForTenant(req, res) {
    try {
      const data = req.body;

      if (!data.tenant_id) {
        res.status(400).json({ message: 'tenant_id is required', error: -1 });
        return;
      }

      const result = await this.treatmentTargetSessionFormsTemplateService.updateTemplateConfigurationsForTenant(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Get tenant configurations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTenantConfigurations(req, res) {
    try {
      const data = req.query;

      if (!data.tenant_id) {
        res.status(400).json({ message: 'tenant_id is required', error: -1 });
        return;
      }

      const result = await this.treatmentTargetSessionFormsTemplateService.getTenantConfigurations(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Compare tenant configurations with template configurations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async compareTenantWithTemplate(req, res) {
    try {
      const data = req.query;

      if (!data.tenant_id) {
        res.status(400).json({ message: 'tenant_id is required', error: -1 });
        return;
      }

      const result = await this.treatmentTargetSessionFormsTemplateService.compareTenantWithTemplate(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Reset tenant configurations to match template exactly
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetTenantConfigurationsToTemplate(req, res) {
    try {
      const data = req.body;

      if (!data.tenant_id) {
        res.status(400).json({ message: 'tenant_id is required', error: -1 });
        return;
      }

      const result = await this.treatmentTargetSessionFormsTemplateService.resetTenantConfigurationsToTemplate(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }
}
