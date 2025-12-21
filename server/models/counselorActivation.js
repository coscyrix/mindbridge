//models/counselorActivation.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';

export default class CounselorActivation {
  //////////////////////////////////////////

  async activateCounselor(counselor_user_id, tenant_id, requester_role_id = null) {
    try {
      // Verify the counselor belongs to the tenant
      // For admin (role_id = 4), we still verify the counselor exists and belongs to the tenant,
      // but we don't require the admin to belong to that tenant
      const counselor = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('user_profile as up', 'u.user_id', 'up.user_id')
        .where('u.user_id', counselor_user_id)
        .andWhere('u.role_id', 2) // role_id = 2 is for counselors
        .andWhere(function() {
          this.where('u.tenant_id', tenant_id)
              .orWhere('up.tenant_id', tenant_id);
        })
        .select('u.user_id', 'u.role_id', 'u.tenant_id', 'up.tenant_id as profile_tenant_id')
        .first();

      if (!counselor) {
        logger.warn(`Counselor ${counselor_user_id} not found or does not belong to tenant ${tenant_id}`);
        return { message: 'Counselor not found or does not belong to this tenant', error: -1 };
      }

      // Update is_active to 1 (active)
      const updateResult = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .where('user_id', counselor_user_id)
        .update({ is_active: 1 });

      if (updateResult === 0) {
        logger.error('Error activating counselor');
        return { message: 'Error activating counselor', error: -1 };
      }

      const requesterType = requester_role_id === 4 ? 'admin' : `tenant ${tenant_id}`;
      logger.info(`Counselor ${counselor_user_id} activated by ${requesterType}`);
      return { message: 'Counselor activated successfully' };
    } catch (error) {
      logger.error('Error activating counselor:', error);
      return { message: 'Error activating counselor', error: -1 };
    }
  }

  //////////////////////////////////////////

  async deactivateCounselor(counselor_user_id, tenant_id, requester_role_id = null) {
    try {
      // Verify the counselor belongs to the tenant
      // For admin (role_id = 4), we still verify the counselor exists and belongs to the tenant,
      // but we don't require the admin to belong to that tenant
      const counselor = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('user_profile as up', 'u.user_id', 'up.user_id')
        .where('u.user_id', counselor_user_id)
        .andWhere('u.role_id', 2) // role_id = 2 is for counselors
        .andWhere(function() {
          this.where('u.tenant_id', tenant_id)
              .orWhere('up.tenant_id', tenant_id);
        })
        .select('u.user_id', 'u.role_id', 'u.tenant_id', 'up.tenant_id as profile_tenant_id')
        .first();

      if (!counselor) {
        logger.warn(`Counselor ${counselor_user_id} not found or does not belong to tenant ${tenant_id}`);
        return { message: 'Counselor not found or does not belong to this tenant', error: -1 };
      }

      // Update is_active to 0 (deactivated)
      const updateResult = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .where('user_id', counselor_user_id)
        .update({ is_active: 0 });

      if (updateResult === 0) {
        logger.error('Error deactivating counselor');
        return { message: 'Error deactivating counselor', error: -1 };
      }

      const requesterType = requester_role_id === 4 ? 'admin' : `tenant ${tenant_id}`;
      logger.info(`Counselor ${counselor_user_id} deactivated by ${requesterType}`);
      return { message: 'Counselor deactivated successfully' };
    } catch (error) {
      logger.error('Error deactivating counselor:', error);
      return { message: 'Error deactivating counselor', error: -1 };
    }
  }

  //////////////////////////////////////////

  async activateUser(user_id, role_id, target_id) {
    try {
      // Get requester info
      const requester = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('user_profile as up', 'u.user_id', 'up.user_id')
        .where('u.user_id', user_id)
        .select('u.user_id', 'u.role_id', 'u.tenant_id', 'up.tenant_id as profile_tenant_id')
        .first();

      if (!requester) {
        logger.warn(`Requester ${user_id} not found`);
        return { message: 'Requester not found', error: -1 };
      }

      // Verify requester role_id matches
      if (requester.role_id !== role_id) {
        logger.warn(`Requester role_id mismatch: expected ${role_id}, got ${requester.role_id}`);
        return { message: 'Invalid requester role', error: -1 };
      }

      // Get target user info
      const targetUser = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('user_profile as up', 'u.user_id', 'up.user_id')
        .where('u.user_id', target_id)
        .select('u.user_id', 'u.role_id', 'u.tenant_id', 'up.tenant_id as profile_tenant_id')
        .first();

      if (!targetUser) {
        logger.warn(`Target user ${target_id} not found`);
        return { message: 'Target user not found', error: -1 };
      }

      const requester_role_id = requester.role_id;
      const target_role_id = targetUser.role_id;

      // Permission validation:
      // 1. Admin (role_id = 4) can activate/deactivate tenants (role_id = 3) AND counselors (role_id = 2)
      // 2. Tenants (role_id = 3) can activate/deactivate counselors (role_id = 2) but NOT fellow tenants (role_id = 3)
      //    AND only counselors that belong to their tenant
      if (requester_role_id === 4) {
        // Admin can activate/deactivate tenants OR counselors
        if (target_role_id !== 3 && target_role_id !== 2) {
          logger.warn(`Admin attempted to activate invalid role (role_id=${target_role_id})`);
          return { message: 'Admins can only activate/deactivate tenants or counselors', error: -1 };
        }
      } else if (requester_role_id === 3) {
        // Tenant can only activate/deactivate counselors, NOT fellow tenants
        if (target_role_id === 3) {
          logger.warn(`Tenant attempted to activate fellow tenant`);
          return { message: 'Tenants cannot activate/deactivate fellow tenants', error: -1 };
        }
        if (target_role_id !== 2) {
          logger.warn(`Tenant attempted to activate non-counselor (role_id=${target_role_id})`);
          return { message: 'Tenants can only activate/deactivate counselors', error: -1 };
        }
        // Verify target counselor belongs to requester's tenant
        const requesterTenantId = requester.tenant_id || requester.profile_tenant_id;
        const targetTenantId = targetUser.tenant_id || targetUser.profile_tenant_id;
        if (!requesterTenantId || !targetTenantId) {
          logger.warn(`Missing tenant_id: requester=${requesterTenantId}, target=${targetTenantId}`);
          return { message: 'Unable to verify tenant relationship', error: -1 };
        }
        if (requesterTenantId !== targetTenantId) {
          logger.warn(`Tenant ${requesterTenantId} attempted to activate counselor ${target_id} from different tenant ${targetTenantId}`);
          return { message: 'Tenants can only activate/deactivate counselors from their own tenant', error: -1 };
        }
      }

      // Update is_active to 1 (active)
      const updateResult = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .where('user_id', target_id)
        .update({ is_active: 1 });

      if (updateResult === 0) {
        logger.error('Error activating user');
        return { message: 'Error activating user', error: -1 };
      }

      const requesterType = requester_role_id === 4 ? 'admin' : `tenant ${requester.tenant_id || requester.profile_tenant_id}`;
      const userType = target_role_id === 2 ? 'counselor' : target_role_id === 3 ? 'tenant' : 'user';
      logger.info(`${userType} ${target_id} (role_id=${target_role_id}) activated by ${requesterType} (user_id=${user_id})`);
      return { message: 'User activated successfully' };
    } catch (error) {
      logger.error('Error activating user:', error);
      return { message: 'Error activating user', error: -1 };
    }
  }

  //////////////////////////////////////////

  async deactivateUser(user_id, role_id, target_id) {
    try {
      // Get requester info
      const requester = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('user_profile as up', 'u.user_id', 'up.user_id')
        .where('u.user_id', user_id)
        .select('u.user_id', 'u.role_id', 'u.tenant_id', 'up.tenant_id as profile_tenant_id')
        .first();

      if (!requester) {
        logger.warn(`Requester ${user_id} not found`);
        return { message: 'Requester not found', error: -1 };
      }

      // Verify requester role_id matches
      if (requester.role_id !== role_id) {
        logger.warn(`Requester role_id mismatch: expected ${role_id}, got ${requester.role_id}`);
        return { message: 'Invalid requester role', error: -1 };
      }

      // Get target user info
      const targetUser = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('user_profile as up', 'u.user_id', 'up.user_id')
        .where('u.user_id', target_id)
        .select('u.user_id', 'u.role_id', 'u.tenant_id', 'up.tenant_id as profile_tenant_id')
        .first();

      if (!targetUser) {
        logger.warn(`Target user ${target_id} not found`);
        return { message: 'Target user not found', error: -1 };
      }

      const requester_role_id = requester.role_id;
      const target_role_id = targetUser.role_id;

      // Permission validation:
      // 1. Admin (role_id = 4) can activate/deactivate tenants (role_id = 3) AND counselors (role_id = 2)
      // 2. Tenants (role_id = 3) can activate/deactivate counselors (role_id = 2) but NOT fellow tenants (role_id = 3)
      //    AND only counselors that belong to their tenant
      if (requester_role_id === 4) {
        // Admin can activate/deactivate tenants OR counselors
        if (target_role_id !== 3 && target_role_id !== 2) {
          logger.warn(`Admin attempted to deactivate invalid role (role_id=${target_role_id})`);
          return { message: 'Admins can only activate/deactivate tenants or counselors', error: -1 };
        }
      } else if (requester_role_id === 3) {
        // Tenant can only activate/deactivate counselors, NOT fellow tenants
        if (target_role_id === 3) {
          logger.warn(`Tenant attempted to deactivate fellow tenant`);
          return { message: 'Tenants cannot activate/deactivate fellow tenants', error: -1 };
        }
        if (target_role_id !== 2) {
          logger.warn(`Tenant attempted to deactivate non-counselor (role_id=${target_role_id})`);
          return { message: 'Tenants can only activate/deactivate counselors', error: -1 };
        }
        // Verify target counselor belongs to requester's tenant
        const requesterTenantId = requester.tenant_id || requester.profile_tenant_id;
        const targetTenantId = targetUser.tenant_id || targetUser.profile_tenant_id;
        if (!requesterTenantId || !targetTenantId) {
          logger.warn(`Missing tenant_id: requester=${requesterTenantId}, target=${targetTenantId}`);
          return { message: 'Unable to verify tenant relationship', error: -1 };
        }
        if (requesterTenantId !== targetTenantId) {
          logger.warn(`Tenant ${requesterTenantId} attempted to deactivate counselor ${target_id} from different tenant ${targetTenantId}`);
          return { message: 'Tenants can only activate/deactivate counselors from their own tenant', error: -1 };
        }
      }

      // Update is_active to 0 (deactivated)
      const updateResult = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .where('user_id', target_id)
        .update({ is_active: 0 });

      if (updateResult === 0) {
        logger.error('Error deactivating user');
        return { message: 'Error deactivating user', error: -1 };
      }

      const requesterType = requester_role_id === 4 ? 'admin' : `tenant ${requester.tenant_id || requester.profile_tenant_id}`;
      const userType = target_role_id === 2 ? 'counselor' : target_role_id === 3 ? 'tenant' : 'user';
      logger.info(`${userType} ${target_id} (role_id=${target_role_id}) deactivated by ${requesterType} (user_id=${user_id})`);
      return { message: 'User deactivated successfully' };
    } catch (error) {
      logger.error('Error deactivating user:', error);
      return { message: 'Error deactivating user', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getCounselorActivationStatus(counselor_user_id, tenant_id) {
    try {
      const counselor = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('user_profile as up', 'u.user_id', 'up.user_id')
        .where('u.user_id', counselor_user_id)
        .andWhere('u.role_id', 2) // role_id = 2 is for counselors
        .andWhere(function() {
          this.where('u.tenant_id', tenant_id)
              .orWhere('up.tenant_id', tenant_id);
        })
        .select(
          'u.user_id',
          'u.email',
          'u.is_active',
          'u.role_id',
          'u.tenant_id',
          'up.user_profile_id',
          'up.user_first_name',
          'up.user_last_name',
          'up.tenant_id as profile_tenant_id'
        )
        .first();

      if (!counselor) {
        return { message: 'Counselor not found or does not belong to this tenant', error: -1 };
      }

      return {
        message: 'Counselor activation status retrieved successfully',
        data: {
          user_id: counselor.user_id,
          user_profile_id: counselor.user_profile_id,
          email: counselor.email,
          name: `${counselor.user_first_name} ${counselor.user_last_name}`,
          is_active: counselor.is_active === 1,
        },
      };
    } catch (error) {
      logger.error('Error getting counselor activation status:', error);
      return { message: 'Error getting counselor activation status', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getCounselorsByTenant(tenant_id) {
    try {
      const counselors = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('user_profile as up', 'u.user_id', 'up.user_id')
        .where(function() {
          this.where('u.tenant_id', tenant_id)
              .orWhere('up.tenant_id', tenant_id);
        })
        .andWhere('u.role_id', 2) // role_id = 2 is for counselors
        .andWhere('u.status_yn', 'y') // Only active accounts (not deleted)
        .select(
          'u.user_id',
          'u.email',
          'u.is_active',
          'u.role_id',
          'up.user_profile_id',
          'up.user_first_name',
          'up.user_last_name',
          'up.user_phone_nbr'
        );

      const formattedCounselors = counselors.map(counselor => ({
        user_id: counselor.user_id,
        user_profile_id: counselor.user_profile_id,
        email: counselor.email,
        name: `${counselor.user_first_name} ${counselor.user_last_name}`,
        phone: counselor.user_phone_nbr,
        is_active: counselor.is_active === 1,
      }));

      return {
        message: 'Counselors retrieved successfully',
        data: formattedCounselors,
      };
    } catch (error) {
      logger.error('Error getting counselors by tenant:', error);
      return { message: 'Error getting counselors by tenant', error: -1 };
    }
  }
}

