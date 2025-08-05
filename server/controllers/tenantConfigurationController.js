import TenantConfigurationService from '../services/tenantConfigurationService.js';

export default class TenantConfigurationController {
  constructor() {
    this.tenantConfigurationService = new TenantConfigurationService();
  }

  //////////////////////////////////////////

  async getTenantConfiguration(req, res) {
    const { tenant_id, feature_name } = req.query;

    if (!tenant_id) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    const result = await this.tenantConfigurationService.getTenantConfiguration(
      parseInt(tenant_id),
      feature_name
    );

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  }

  //////////////////////////////////////////

  async updateTenantConfiguration(req, res) {
    const data = req.body;

    if (!data.tenant_id || !data.feature_name) {
      res.status(400).json({ message: 'Tenant ID and feature name are required' });
      return;
    }

    const result = await this.tenantConfigurationService.updateTenantConfiguration(data);

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  }

  //////////////////////////////////////////

  async isFeatureEnabled(req, res) {
    const { tenant_id, feature_name } = req.query;

    if (!tenant_id || !feature_name) {
      res.status(400).json({ message: 'Tenant ID and feature name are required' });
      return;
    }

    const result = await this.tenantConfigurationService.isFeatureEnabled(
      parseInt(tenant_id),
      feature_name
    );

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({ is_enabled: result });
  }

  //////////////////////////////////////////

  async getFeatureValue(req, res) {
    const { tenant_id, feature_name } = req.query;

    if (!tenant_id || !feature_name) {
      res.status(400).json({ message: 'Tenant ID and feature name are required' });
      return;
    }

    const result = await this.tenantConfigurationService.getFeatureValue(
      parseInt(tenant_id),
      feature_name
    );

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({ feature_value: result });
  }
} 