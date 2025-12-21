//services/counselorActivation.js

import CounselorActivation from '../models/counselorActivation.js';

export default class CounselorActivationService {
  async activateCounselor(counselor_user_id, tenant_id, requester_role_id = null) {
    const counselorActivation = new CounselorActivation();
    return counselorActivation.activateCounselor(counselor_user_id, tenant_id, requester_role_id);
  }

  async deactivateCounselor(counselor_user_id, tenant_id, requester_role_id = null) {
    const counselorActivation = new CounselorActivation();
    return counselorActivation.deactivateCounselor(counselor_user_id, tenant_id, requester_role_id);
  }

  async activateUser(user_id, role_id, target_id) {
    const counselorActivation = new CounselorActivation();
    return counselorActivation.activateUser(user_id, role_id, target_id);
  }

  async deactivateUser(user_id, role_id, target_id) {
    const counselorActivation = new CounselorActivation();
    return counselorActivation.deactivateUser(user_id, role_id, target_id);
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

