//models/counselorActivation.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
import logger from '../config/winston.js';
const knex = require('knex');

const db = knex(DBconn.dbConn.development);

export default class CounselorActivation {
  //////////////////////////////////////////

  async activateCounselor(counselor_user_id, tenant_id) {
    try {
      // Verify the counselor belongs to the tenant
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

      logger.info(`Counselor ${counselor_user_id} activated by tenant ${tenant_id}`);
      return { message: 'Counselor activated successfully' };
    } catch (error) {
      logger.error('Error activating counselor:', error);
      return { message: 'Error activating counselor', error: -1 };
    }
  }

  //////////////////////////////////////////

  async deactivateCounselor(counselor_user_id, tenant_id) {
    try {
      // Verify the counselor belongs to the tenant
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

      logger.info(`Counselor ${counselor_user_id} deactivated by tenant ${tenant_id}`);
      return { message: 'Counselor deactivated successfully' };
    } catch (error) {
      logger.error('Error deactivating counselor:', error);
      return { message: 'Error deactivating counselor', error: -1 };
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

