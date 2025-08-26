import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import Common from './common.js';

const db = knex(DBconn.dbConn.development);

export default class Report {
  ///////////////////////////////////////////
  constructor() {
    this.common = new Common();
  }
  //////////////////////////////////////////
  async getUserForm(data) {
    try {
      // Get form mode from environment variable
      const formMode = process.env.FORM_MODE || 'auto';
      
      let query;

      console.log('formMode', formMode);
      
      
      if (formMode === 'treatment_target') {
        // Treatment target mode: query treatment target session forms
        query = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('treatment_target_session_forms as tt')
          .join('user_profile as client', 'tt.client_id', 'client.user_profile_id')
          .join('user_profile as counselor', 'tt.counselor_id', 'counselor.user_profile_id')
          .join('forms as f', 'tt.form_id', 'f.form_id')
          .join('thrpy_req as tr', 'tt.req_id', 'tr.req_id')
          .select(
            'client.user_first_name as client_first_name',
            'client.user_last_name as client_last_name',
            'client.clam_num as client_clam_num',
            'tt.client_id',
            'tt.counselor_id',
            'tt.form_id',
            'f.form_cde as form_cde',
            'tt.req_id as thrpy_req_id',
            'tt.tenant_id',
            db.raw('MAX(tt.sent_at) as date_sent'),
            db.raw(`
                COALESCE(
                  DATE_ADD(MAX(tt.sent_at), INTERVAL 7 DAY),
                  DATE_ADD(MAX(tt.sent_at), INTERVAL 7 DAY)
                ) as due_date
              `),
          )
          .where('tt.is_sent', 1)
          .andWhere('client.status_yn', 'y')
          .groupBy([
            'client.user_first_name',
            'client.user_last_name',
            'client.clam_num',
            'tt.form_id',
            'f.form_cde',
            'tt.client_id',
            'tt.counselor_id',
            'tt.req_id',
            'tt.tenant_id',
          ])
          .orderBy('date_sent', 'desc');
      } else {
        // Service mode or auto mode: query user forms (service-based forms)
        query = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('v_user_form')
          .select(
            'client_first_name',
            'client_last_name',
            'client_clam_num',
            'client_id',
            'counselor_id',
            'form_id',
            'form_cde',
            'thrpy_req_id',
            'tenant_id',
            db.raw('MAX(updated_at) as date_sent'),
            db.raw(`
                COALESCE(
                  MAX(due_date), 
                  DATE_ADD(MAX(updated_at), INTERVAL 7 DAY)
                ) as due_date
              `),
          )
          .where('is_sent', 1)
          .andWhere('client_status_yn', 'y')
          .groupBy([
            'client_first_name',
            'client_last_name',
            'client_clam_num',
            'form_id',
            'form_cde',
            'client_id',
            'counselor_id',
            'thrpy_req_id',
            'tenant_id',
          ])
          .orderBy('date_sent', 'desc');
      }

      if (data.role_id === 2) {
        if (data.counselor_id) {
          if (formMode === 'treatment_target') {
            query.where('tt.counselor_id', data.counselor_id);
          } else {
            query.where('counselor_id', data.counselor_id);
          }
          
          // Get tenant_id for the counselor and filter by it
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            if (formMode === 'treatment_target') {
              query.where('tt.tenant_id', Number(tenantId[0].tenant_id));
            } else {
              query.where('tenant_id', Number(tenantId[0].tenant_id));
            }
          }
        }

        if (data.client_id) {
          if (formMode === 'treatment_target') {
            query.where('tt.client_id', data.client_id);
          } else {
            query.where('client_id', data.client_id);
          }
        }

        if (data.form_id) {
          if (formMode === 'treatment_target') {
            query.where('tt.form_id', data.form_id);
          } else {
            query.where('form_id', data.form_id);
          }
        }
      }

      if (data.role_id === 3) {
        // If the user is a manager, filter by tenant_id
        if (data.tenant_id) {
          // Use the provided tenant_id directly
          if (formMode === 'treatment_target') {
            query.where('tt.tenant_id', Number(data.tenant_id));
          } else {
            query.where('tenant_id', Number(data.tenant_id));
          }
        } else if (data.counselor_id) {
          // If no tenant_id provided but counselor_id is, get tenant_id from counselor
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            if (formMode === 'treatment_target') {
              query.where('tt.tenant_id', Number(tenantId[0].tenant_id));
            } else {
              query.where('tenant_id', Number(tenantId[0].tenant_id));
            }
          }
        }
        
        // If counselor_id is provided, also filter by specific counselor
        if (data.counselor_id) {
          if (formMode === 'treatment_target') {
            query.where('tt.counselor_id', data.counselor_id);
          } else {
            query.where('counselor_id', data.counselor_id);
          }
        }
      }

      // Handle other role_ids (like role_id === 4) - always include tenant_id when counselor_id is provided
      if (data.role_id !== 2 && data.role_id !== 3 && data.counselor_id) {
        const tenantId = await this.common.getUserTenantId({
          user_profile_id: data.counselor_id,
        });
        if (tenantId && !tenantId.error && tenantId.length > 0) {
          if (formMode === 'treatment_target') {
            query.where('tt.tenant_id', Number(tenantId[0].tenant_id));
          } else {
            query.where('tenant_id', Number(tenantId[0].tenant_id));
          }
        } else {
          // If we can't get tenant_id for the counselor, return an error
          return { message: 'Invalid counselor_id or counselor not found', error: -1 };
        }
        if (formMode === 'treatment_target') {
          query.where('tt.counselor_id', data.counselor_id);
        } else {
          query.where('counselor_id', data.counselor_id);
        }
      }

      const rec = await query;

      return rec;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting reports', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getSessionReport(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .select(
          'client_id',
          'client_first_name',
          'client_last_name',
          'counselor_id',
          'tenant_id',
          db.raw('intake_date as due_date'),
          db.raw('service_name as report_name'),
          db.raw(`
            CASE 
              WHEN intake_date < CURRENT_DATE() THEN 'Past Due Date'
              WHEN intake_date > CURRENT_DATE() THEN 'Future Due Date'
              ELSE 'Current Due Date'
            END as report_status
          `),
        )
        .where('is_report', 1)
        .where('status_yn', 'y')
        .andWhere('thrpy_status', 'ONGOING')
        .whereNot('session_status', 'SHOW');

      if (data.role_id === 2) {
        if (data.counselor_id) {
          query.andWhere('counselor_id', data.counselor_id);
          
          // Get tenant_id for the counselor and filter by it
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            query.where('tenant_id', Number(tenantId[0].tenant_id));
          }
        }

        if (data.client_id) {
          query.andWhere('client_id', data.client_id);
        }

        if (data.session_id) {
          query.andWhere('session_id', data.session_id);
        }

        if (data.start_date) {
          query.andWhere('intake_date', '>=', data.start_date);
        }

        if (data.end_date) {
          query.andWhere('intake_date', '<=', data.end_date);
        }
      }

      if (data.role_id === 3) {
        // If the user is a manager, filter by tenant_id
        if (data.tenant_id) {
          // Use the provided tenant_id directly
          query.where('tenant_id', Number(data.tenant_id));
        } else if (data.counselor_id) {
          // If no tenant_id provided but counselor_id is, get tenant_id from counselor
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            query.where('tenant_id', Number(tenantId[0].tenant_id));
          }
        }
        
        // If counselor_id is provided, also filter by specific counselor
        if (data.counselor_id) {
          query.where('counselor_id', data.counselor_id);
        }
        
        if (data.start_date) {
          query.andWhere('intake_date', '>=', data.start_date);
        }

        if (data.end_date) {
          query.andWhere('intake_date', '<=', data.end_date);
        }
      }

      // Handle other role_ids (like role_id === 4) - always include tenant_id when counselor_id is provided
      if (data.role_id !== 2 && data.role_id !== 3 && data.counselor_id) {
        const tenantId = await this.common.getUserTenantId({
          user_profile_id: data.counselor_id,
        });
        if (tenantId && !tenantId.error && tenantId.length > 0) {
          query.where('tenant_id', Number(tenantId[0].tenant_id));
        } else {
          // If we can't get tenant_id for the counselor, return an error
          return { message: 'Invalid counselor_id or counselor not found', error: -1 };
        }
        query.where('counselor_id', data.counselor_id);
        
        if (data.start_date) {
          query.andWhere('intake_date', '>=', data.start_date);
        }

        if (data.end_date) {
          query.andWhere('intake_date', '<=', data.end_date);
        }
      }

      // Order results: Past Due Date, then Current Due Date, then Future Due Date
      query.orderByRaw(`
        CASE 
          WHEN intake_date < CURRENT_DATE() THEN 1
          WHEN intake_date = CURRENT_DATE() THEN 2
          ELSE 3
        END
      `);
      query.orderBy('intake_date');

      const rec = await query;

      return rec;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting reports', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserSessionStatReport(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_thrpy_req')
        .select(
          'client_id',
          'client_first_name',
          'client_last_name',
          'counselor_id',
          'tenant_id',
          db.raw(`
            (SELECT COUNT(*) 
             FROM JSON_TABLE(
               session_obj,
               '$[*]' COLUMNS(
                 status VARCHAR(20) PATH '$.session_status',
                 is_report INT PATH '$.is_report',
                 is_additional INT PATH '$.is_additional'
               )
             ) as sessions
             WHERE status = 'SHOW' 
             AND (is_report != 1 OR is_report IS NULL)
             AND (is_additional != 1 OR is_additional IS NULL)) as show_session_count
          `),
          db.raw(`
            (SELECT COUNT(*) 
             FROM JSON_TABLE(
               session_obj,
               '$[*]' COLUMNS(
                 status VARCHAR(20) PATH '$.session_status',
                 is_report INT PATH '$.is_report',
                 is_additional INT PATH '$.is_additional'
               )
             ) as sessions
             WHERE status = 'NO-SHOW'
             AND (is_report != 1 OR is_report IS NULL)
             AND (is_additional != 1 OR is_additional IS NULL)) as no_show_session_count
          `),
          db.raw(`
          (SELECT COUNT(*) 
           FROM JSON_TABLE(
             session_obj,
             '$[*]' COLUMNS(
               is_report INT PATH '$.is_report',
               is_additional INT PATH '$.is_additional'
             )
           ) as sessions
           WHERE (is_report != 1 OR is_report IS NULL) 
           AND (is_additional != 1 OR is_additional IS NULL)) as total_session_count
        `),
        )
        .where('thrpy_status', 'ONGOING')
        .andWhere('status_yn', 'y');

      if (data.role_id == 2) {
        if (data.counselor_id) {
          query.where('counselor_id', data.counselor_id);
          
          // Get tenant_id for the counselor and filter by it
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            query.where('tenant_id', Number(tenantId[0].tenant_id));
          }
        }

        if (data.client_id) {
          query.where('client_id', data.client_id);
        }

        if (data.session_id) {
          query.where('session_id', data.session_id);
        }
        if (data.start_date) {
          query.where('intake_date', '>=', data.start_date);
        }
        if (data.end_date) {
          query.where('intake_date', '<=', data.end_date);
        }
      }

      if (data.role_id == 3) {
        // If the user is a manager, filter by tenant_id
        if (data.tenant_id) {
          // Use the provided tenant_id directly
          query.where('tenant_id', Number(data.tenant_id));
        } else if (data.counselor_id) {
          // If no tenant_id provided but counselor_id is, get tenant_id from counselor
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            query.where('tenant_id', Number(tenantId[0].tenant_id));
          }
        }
        
        // If counselor_id is provided, also filter by specific counselor
        if (data.counselor_id) {
          query.where('counselor_id', data.counselor_id);
        }
        
        if (data.start_date) {
          query.andWhere('intake_date', '>=', data.start_date);
        }

        if (data.end_date) {
          query.andWhere('intake_date', '<=', data.end_date);
        }
      }

      // Handle other role_ids (like role_id === 4) - always include tenant_id when counselor_id is provided
      if (data.role_id !== 2 && data.role_id !== 3 && data.counselor_id) {
        const tenantId = await this.common.getUserTenantId({
          user_profile_id: data.counselor_id,
        });
        if (tenantId && !tenantId.error && tenantId.length > 0) {
          query.where('tenant_id', Number(tenantId[0].tenant_id));
        } else {
          // If we can't get tenant_id for the counselor, return an error
          return { message: 'Invalid counselor_id or counselor not found', error: -1 };
        }
        query.where('counselor_id', data.counselor_id);
        
        if (data.start_date) {
          query.andWhere('intake_date', '>=', data.start_date);
        }

        if (data.end_date) {
          query.andWhere('intake_date', '<=', data.end_date);
        }
      }

      const rec = await query;

      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting reports', error: -1 };
    }
  }
}
