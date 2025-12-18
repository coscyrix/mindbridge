//services/counselorActivation.js

import CounselorActivation from '../models/counselorActivation.js';

export default class CounselorActivationService {
  async activateCounselor(counselor_user_id, tenant_id) {
    const counselorActivation = new CounselorActivation();
    return counselorActivation.activateCounselor(counselor_user_id, tenant_id);
  }

  async deactivateCounselor(counselor_user_id, tenant_id) {
    const counselorActivation = new CounselorActivation();
    return counselorActivation.deactivateCounselor(counselor_user_id, tenant_id);
  }

  async getCounselorActivationStatus(counselor_user_id, tenant_id) {
    const counselorActivation = new CounselorActivation();
    return counselorActivation.getCounselorActivationStatus(counselor_user_id, tenant_id);
  }

  async getCounselorsByTenant(tenant_id) {
    const counselorActivation = new CounselorActivation();
    return counselorActivation.getCounselorsByTenant(tenant_id);
  }
}

