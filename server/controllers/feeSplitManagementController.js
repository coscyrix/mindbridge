import FeeSplitManagementService from '../services/feeSplitManagementService.js';

export default class FeeSplitManagementController {
  constructor() {
    this.feeSplitManagementService = new FeeSplitManagementService();
  }

  //////////////////////////////////////////

  async getFeeSplitConfiguration(req, res) {
    const { tenant_id, counselor_user_id } = req.query;

    if (!tenant_id) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    const result = await this.feeSplitManagementService.getFeeSplitConfiguration(tenant_id, counselor_user_id);

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.json({
      success: true,
      data: result
    });
  }

  //////////////////////////////////////////

  async createFeeSplitConfiguration(req, res) {
    const data = req.body;

    if (!data.tenant_id) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    if (typeof data.is_fee_split_enabled !== 'boolean') {
      res.status(400).json({ message: 'is_fee_split_enabled must be a boolean value' });
      return;
    }

    // Validate percentages when fee split is enabled
    if (data.is_fee_split_enabled) {
      if (typeof data.tenant_share_percentage !== 'number' || typeof data.counselor_share_percentage !== 'number') {
        res.status(400).json({ message: 'Both tenant_share_percentage and counselor_share_percentage are required when fee split is enabled' });
        return;
      }

      if (data.tenant_share_percentage < 0 || data.tenant_share_percentage > 100 || 
          data.counselor_share_percentage < 0 || data.counselor_share_percentage > 100) {
        res.status(400).json({ message: 'Percentages must be between 0 and 100' });
        return;
      }

      if (data.tenant_share_percentage + data.counselor_share_percentage !== 100) {
        res.status(400).json({ message: 'Tenant and counselor share percentages must sum to 100%' });
        return;
      }
    }

    const result = await this.feeSplitManagementService.createFeeSplitConfiguration(data);

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  }

  //////////////////////////////////////////

  async updateFeeSplitConfiguration(req, res) {
    const data = req.body;

    if (!data.tenant_id) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    if (typeof data.is_fee_split_enabled !== 'boolean') {
      res.status(400).json({ message: 'is_fee_split_enabled must be a boolean value' });
      return;
    }

    // Validate percentages when fee split is enabled
    if (data.is_fee_split_enabled) {
      if (typeof data.tenant_share_percentage !== 'number' || typeof data.counselor_share_percentage !== 'number') {
        res.status(400).json({ message: 'Both tenant_share_percentage and counselor_share_percentage are required when fee split is enabled' });
        return;
      }

      if (data.tenant_share_percentage < 0 || data.tenant_share_percentage > 100 || 
          data.counselor_share_percentage < 0 || data.counselor_share_percentage > 100) {
        res.status(400).json({ message: 'Percentages must be between 0 and 100' });
        return;
      }

      if (data.tenant_share_percentage + data.counselor_share_percentage !== 100) {
        res.status(400).json({ message: 'Tenant and counselor share percentages must sum to 100%' });
        return;
      }
    }

    const result = await this.feeSplitManagementService.updateFeeSplitConfiguration(data);

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  }

  //////////////////////////////////////////

  async isFeeSplitEnabled(req, res) {
    const { tenant_id, counselor_user_id } = req.query;

    if (!tenant_id) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    const result = await this.feeSplitManagementService.isFeeSplitEnabled(
      parseInt(tenant_id),
      counselor_user_id ? parseInt(counselor_user_id) : null
    );

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      is_fee_split_enabled: result
    });
  }

  //////////////////////////////////////////

  async getFeeSplitPercentages(req, res) {
    const { tenant_id, counselor_user_id } = req.query;

    if (!tenant_id) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    const result = await this.feeSplitManagementService.getFeeSplitPercentages(
      parseInt(tenant_id),
      counselor_user_id ? parseInt(counselor_user_id) : null
    );

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  }

  //////////////////////////////////////////

  async validateFeeSplitConfiguration(req, res) {
    const data = req.body;

    if (!data.tenant_id) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    const result = await this.feeSplitManagementService.validateFeeSplitConfiguration(data);

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Fee split configuration is valid'
    });
  }

  //////////////////////////////////////////

  async getAllFeeSplitConfigurations(req, res) {
    const { tenant_id } = req.query;

    const result = await this.feeSplitManagementService.getAllFeeSplitConfigurations(
      tenant_id ? parseInt(tenant_id) : null
    );

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  }

  //////////////////////////////////////////

  async getCounselorSpecificConfigurations(req, res) {
    const { tenant_id } = req.query;

    if (!tenant_id) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    const result = await this.feeSplitManagementService.getCounselorSpecificConfigurations(
      parseInt(tenant_id)
    );

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  }

  //////////////////////////////////////////

  async getCounselorsByTenant(req, res) {
    const { tenant_id } = req.query;

    if (!tenant_id) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    const result = await this.feeSplitManagementService.getCounselorsByTenant(
      parseInt(tenant_id)
    );

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  }

  //////////////////////////////////////////

  async deleteFeeSplitConfiguration(req, res) {
    const { tenant_id, counselor_user_id } = req.params;

    if (!tenant_id) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    const result = await this.feeSplitManagementService.deleteFeeSplitConfiguration(
      parseInt(tenant_id),
      counselor_user_id ? parseInt(counselor_user_id) : null
    );

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message
    });
  }
} 