import TreatmentTargetSessionFormsTemplateService from '../services/treatmentTargetSessionFormsTemplate.js';

export default class TreatmentTargetSessionFormsTemplateController {
  //////////////////////////////////////////

  constructor() {
    this.service = new TreatmentTargetSessionFormsTemplateService();
  }

  //////////////////////////////////////////
  // TEMPLATE CRUD ENDPOINTS
  //////////////////////////////////////////

  /**
   * Create a new template
   * POST /api/treatment-target-templates
   */
  async createTemplate(req, res) {
    try {
      const data = req.body;
      const result = await this.service.createTemplate(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Create a template with service frequencies
   * POST /api/treatment-target-templates/with-frequencies
   */
  async createTemplateWithFrequencies(req, res) {
    try {
      const data = req.body;
      const result = await this.service.createTemplateWithFrequencies(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Get all templates with service frequencies
   * GET /api/treatment-target-templates
   */
  async getAllTemplates(req, res) {
    try {
      const result = await this.service.getAllTemplates();

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
   * Get a template by ID
   * GET /api/treatment-target-templates/:id
   */
  async getTemplateById(req, res) {
    try {
      const { id } = req.params;
      const result = await this.service.getTemplateById(id);

      if (result.error) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Get templates by treatment_target
   * GET /api/treatment-target-templates/by-treatment-target?treatment_target=Anxiety
   */
  async getTemplatesByTreatmentTarget(req, res) {
    try {
      const { treatment_target } = req.query;

      if (!treatment_target) {
        res.status(400).json({ message: 'treatment_target is required', error: -1 });
        return;
      }

      const result = await this.service.getTemplatesByTreatmentTarget(treatment_target);

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
   * Get a template by treatment_target and form_name
   * GET /api/treatment-target-templates/lookup?treatment_target=Anxiety&form_name=GAD-7
   */
  async getTemplateByLookup(req, res) {
    try {
      const { treatment_target, form_name } = req.query;

      if (!treatment_target || !form_name) {
        res.status(400).json({ message: 'treatment_target and form_name are required', error: -1 });
        return;
      }

      const result = await this.service.getTemplateByTreatmentTargetAndFormName(treatment_target, form_name);

      if (result.error) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Update a template
   * PUT /api/treatment-target-templates/:id
   */
  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await this.service.updateTemplate(id, data);

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
   * Delete a template
   * DELETE /api/treatment-target-templates/:id
   */
  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteTemplate(id);

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
  // SERVICE FREQUENCY ENDPOINTS
  //////////////////////////////////////////

  /**
   * Add a service frequency to a template
   * POST /api/treatment-target-templates/:templateId/frequencies
   */
  async addServiceFrequency(req, res) {
    try {
      const { templateId } = req.params;
      const data = {
        template_id: parseInt(templateId),
        ...req.body,
      };
      const result = await this.service.addServiceFrequency(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Add multiple service frequencies to a template
   * POST /api/treatment-target-templates/:templateId/frequencies/bulk
   */
  async addMultipleServiceFrequencies(req, res) {
    try {
      const { templateId } = req.params;
      const frequencies = req.body.frequencies || req.body;
      const result = await this.service.addMultipleServiceFrequencies(parseInt(templateId), frequencies);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////

  /**
   * Get service frequencies for a template
   * GET /api/treatment-target-templates/:templateId/frequencies
   */
  async getServiceFrequencies(req, res) {
    try {
      const { templateId } = req.params;
      const result = await this.service.getServiceFrequencies(templateId);

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
   * Update a service frequency
   * PUT /api/treatment-target-templates/frequencies/:id
   */
  async updateServiceFrequency(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await this.service.updateServiceFrequency(id, data);

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
   * Delete a service frequency
   * DELETE /api/treatment-target-templates/frequencies/:id
   */
  async deleteServiceFrequency(req, res) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteServiceFrequency(id);

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
   * Get session frequency for a specific combination
   * GET /api/treatment-target-templates/session-frequency?treatment_target=...&form_name=...&service_template_id=...&nbr_of_sessions=...
   */
  async getSessionFrequency(req, res) {
    try {
      const { treatment_target, form_name, service_template_id, nbr_of_sessions } = req.query;

      const result = await this.service.getSessionFrequency({
        treatment_target,
        form_name,
        service_template_id: parseInt(service_template_id),
        nbr_of_sessions: parseInt(nbr_of_sessions),
      });

      if (result.error) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  //////////////////////////////////////////
  // LEGACY ENDPOINTS (for backward compatibility)
  //////////////////////////////////////////

  /**
   * Get all template configurations (legacy)
   * GET /api/treatment-target-templates/templates
   */
  async getTemplateConfigurations(req, res) {
    try {
      const result = await this.service.getTemplateConfigurations();

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
   * POST /api/treatment-target-templates/copy-to-tenant
   */
  async copyTemplateConfigurationsToTenant(req, res) {
    try {
      const data = req.body;

      if (!data.tenant_id) {
        res.status(400).json({ message: 'tenant_id is required', error: -1 });
        return;
      }

      const result = await this.service.copyTemplateConfigurationsToTenant(data);

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
   * POST /api/treatment-target-templates/update-tenant
   */
  async updateTemplateConfigurationsForTenant(req, res) {
    try {
      const data = req.body;

      if (!data.tenant_id) {
        res.status(400).json({ message: 'tenant_id is required', error: -1 });
        return;
      }

      const result = await this.service.updateTemplateConfigurationsForTenant(data);

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
   * GET /api/treatment-target-templates/tenant-configurations
   */
  async getTenantConfigurations(req, res) {
    try {
      const data = req.query;

      if (!data.tenant_id) {
        res.status(400).json({ message: 'tenant_id is required', error: -1 });
        return;
      }

      const result = await this.service.getTenantConfigurations(data);

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
   * GET /api/treatment-target-templates/compare-tenant
   */
  async compareTenantWithTemplate(req, res) {
    try {
      const data = req.query;

      if (!data.tenant_id) {
        res.status(400).json({ message: 'tenant_id is required', error: -1 });
        return;
      }

      const result = await this.service.compareTenantWithTemplate(data);

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
   * POST /api/treatment-target-templates/reset-tenant
   */
  async resetTenantConfigurationsToTemplate(req, res) {
    try {
      const data = req.body;

      if (!data.tenant_id) {
        res.status(400).json({ message: 'tenant_id is required', error: -1 });
        return;
      }

      const result = await this.service.resetTenantConfigurationsToTemplate(data);

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
