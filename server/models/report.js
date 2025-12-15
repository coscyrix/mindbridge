import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;
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
      let consentFormsQuery;
      let requestFormsQuery;

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
          .leftJoin('feedback as fb', function() {
            this.on('fb.form_id', '=', 'tt.form_id')
                .andOn(function() {
                  this.on('fb.session_id', '=', 'tt.session_id')
                      .orOnNull('fb.session_id');
                });
          })
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
            db.raw('MAX(fb.feedback_id) as feedback_id'),
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
          .andWhere('tr.thrpy_status', '!=', 2) // Exclude discharged therapy requests
          .andWhere('f.form_cde', '!=', 'SESSION SUM REPORT') // Exclude attendance forms
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

        // Also get consent forms from v_user_form view for treatment target mode
        consentFormsQuery = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('v_user_form as vuf')
          .leftJoin('thrpy_req as tr', 'vuf.thrpy_req_id', 'tr.req_id')
          // Join to get active therapy request if vuf.thrpy_req_id is null
          .leftJoin('thrpy_req as tr_active', function() {
            this.on('tr_active.client_id', '=', 'vuf.client_id')
                .andOn('tr_active.counselor_id', '=', 'vuf.counselor_id')
                .andOnVal('tr_active.thrpy_status', '=', 1); // 1 = ONGOING
          })
          .leftJoin('feedback as fb', function() {
            this.on('fb.form_id', '=', 'vuf.form_id')
                .andOn(function() {
                  // For consent forms, match by client_id and form_id since they don't have session_id
                  this.on('fb.client_id', '=', 'vuf.client_id')
                      .andOnNull('fb.session_id');
                });
          })
          // Join to get client's role_id to filter tenant consent forms
          .leftJoin('user_profile as client_up', 'vuf.client_id', 'client_up.user_profile_id')
          .leftJoin('users as client_user', 'client_up.user_id', 'client_user.user_id')
          .select(
            'vuf.client_first_name',
            'vuf.client_last_name',
            'vuf.client_clam_num',
            'vuf.client_id',
            'vuf.counselor_id',
            'vuf.form_id',
            'vuf.form_cde',
            // Use vuf.thrpy_req_id if available, otherwise use the active therapy request
            db.raw('COALESCE(vuf.thrpy_req_id, MAX(tr_active.req_id)) as thrpy_req_id'),
            'vuf.tenant_id',
            'vuf.user_form_id', // Include user_form_id to make each consent form unique
            db.raw('MAX(fb.feedback_id) as feedback_id'),
            db.raw('MAX(vuf.updated_at) as date_sent'),
            db.raw(`
                COALESCE(
                  MAX(vuf.due_date), 
                  DATE_ADD(MAX(vuf.updated_at), INTERVAL 7 DAY)
                ) as due_date
              `),
            'client_user.role_id as client_role_id', // Include client's role_id for filtering
          )
          .where('vuf.is_sent', 1)
          .andWhere('vuf.client_status_yn', 'y')
          .andWhere('vuf.form_cde', 'CONSENT') // Only get consent forms
          .andWhere(function() {
            // Exclude discharged therapy requests
            this.where(function() {
              this.where('tr.thrpy_status', '!=', 2).orWhereNull('tr.thrpy_status');
            })
            .orWhere(function() {
              // Also allow if there's an active therapy request via tr_active
              this.whereNotNull('tr_active.req_id');
            });
          })
          .groupBy([
            'vuf.client_first_name',
            'vuf.client_last_name',
            'vuf.client_clam_num',
            'vuf.form_id',
            'vuf.form_cde',
            'vuf.client_id',
            'vuf.counselor_id',
            'vuf.thrpy_req_id', // Keep original thrpy_req_id in GROUP BY
            'vuf.tenant_id',
            'vuf.user_form_id', // Add user_form_id to GROUP BY to make each consent form unique
            'client_user.role_id', // Add client's role_id to GROUP BY for filtering
          ])
          .orderBy('date_sent', 'desc');

        // Also get treatment target request forms (forms tied to therapy requests, not sessions)
        requestFormsQuery = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('treatment_target_request_forms as ttrf')
          .join('user_profile as client', 'ttrf.client_id', 'client.user_profile_id')
          .join('user_profile as counselor', 'ttrf.counselor_id', 'counselor.user_profile_id')
          .join('forms as f', 'ttrf.form_id', 'f.form_id')
          .join('thrpy_req as tr', 'ttrf.req_id', 'tr.req_id')
          .leftJoin('feedback as fb', function() {
            this.on('fb.form_id', '=', 'ttrf.form_id')
                .andOn('fb.client_id', '=', 'ttrf.client_id');
          })
          .select(
            'client.user_first_name as client_first_name',
            'client.user_last_name as client_last_name',
            'client.clam_num as client_clam_num',
            'ttrf.client_id',
            'ttrf.counselor_id',
            'ttrf.form_id',
            'f.form_cde as form_cde',
            'ttrf.req_id as thrpy_req_id',
            'ttrf.tenant_id',
            db.raw('MAX(fb.feedback_id) as feedback_id'),
            db.raw('MAX(ttrf.sent_at) as date_sent'),
            db.raw(`
                COALESCE(
                  DATE_ADD(MAX(ttrf.sent_at), INTERVAL 7 DAY),
                  DATE_ADD(MAX(ttrf.sent_at), INTERVAL 7 DAY)
                ) as due_date
              `),
          )
          .where('ttrf.is_sent', 1)
          .andWhere('client.status_yn', 'y')
          .andWhere('tr.thrpy_status', '!=', 2) // Exclude discharged therapy requests
          .groupBy([
            'client.user_first_name',
            'client.user_last_name',
            'client.clam_num',
            'ttrf.form_id',
            'f.form_cde',
            'ttrf.client_id',
            'ttrf.counselor_id',
            'ttrf.req_id',
            'ttrf.tenant_id',
          ])
          .orderBy('date_sent', 'desc');
      } else {
        // Service mode or auto mode: query user forms (service-based forms)
        query = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('v_user_form as vuf')
          .leftJoin('thrpy_req as tr', 'vuf.thrpy_req_id', 'tr.req_id')
          // Join to get active therapy request if vuf.thrpy_req_id is null
          .leftJoin('thrpy_req as tr_active', function() {
            this.on('tr_active.client_id', '=', 'vuf.client_id')
                .andOn('tr_active.counselor_id', '=', 'vuf.counselor_id')
                .andOnVal('tr_active.thrpy_status', '=', 1); // 1 = ONGOING
          })
          .leftJoin('feedback as fb', function() {
            this.on('fb.form_id', '=', 'vuf.form_id')
                .andOn(function() {
                  // For forms with session_id, match by session_id
                  this.on('fb.session_id', '=', 'vuf.session_id')
                      .orOn(function() {
                        // For consent forms without session_id, match by client_id and null session_id
                        this.on('fb.client_id', '=', 'vuf.client_id')
                            .andOnNull('fb.session_id');
                      });
                });
          })
          // Join to get client's role_id to filter tenant consent forms
          .leftJoin('user_profile as client_up', 'vuf.client_id', 'client_up.user_profile_id')
          .leftJoin('users as client_user', 'client_up.user_id', 'client_user.user_id')
          .select(
            'vuf.client_first_name',
            'vuf.client_last_name',
            'vuf.client_clam_num',
            'vuf.client_id',
            'vuf.counselor_id',
            'vuf.form_id',
            'vuf.form_cde',
            // Use vuf.thrpy_req_id if available, otherwise use the active therapy request
            db.raw('COALESCE(vuf.thrpy_req_id, MAX(tr_active.req_id)) as thrpy_req_id'),
            'vuf.tenant_id',
            'vuf.user_form_id', // Include user_form_id to make each form unique
            db.raw('MAX(fb.feedback_id) as feedback_id'),
            db.raw('MAX(vuf.updated_at) as date_sent'),
            db.raw(`
                COALESCE(
                  MAX(vuf.due_date), 
                  DATE_ADD(MAX(vuf.updated_at), INTERVAL 7 DAY)
                ) as due_date
              `),
            'client_user.role_id as client_role_id', // Include client's role_id for filtering
          )
          .where('vuf.is_sent', 1)
          .andWhere('vuf.client_status_yn', 'y')
          .andWhere('vuf.form_cde', '!=', 'SESSION SUM REPORT') // Exclude attendance forms
          .andWhere(function() {
            // Exclude discharged therapy requests
            this.where(function() {
              this.where('tr.thrpy_status', '!=', 2).orWhereNull('tr.thrpy_status');
            })
            .orWhere(function() {
              // Also allow if there's an active therapy request via tr_active
              this.whereNotNull('tr_active.req_id');
            });
          })
          .groupBy([
            'vuf.client_first_name',
            'vuf.client_last_name',
            'vuf.client_clam_num',
            'vuf.form_id',
            'vuf.form_cde',
            'vuf.client_id',
            'vuf.counselor_id',
            'vuf.thrpy_req_id', // Keep original thrpy_req_id in GROUP BY
            'vuf.tenant_id',
            'vuf.user_form_id', // Add user_form_id to GROUP BY to make each form unique
            'client_user.role_id', // Add client's role_id to GROUP BY for filtering
          ])
          .orderBy('date_sent', 'desc');
      }

      if (data.role_id === 2) {
        if (data.counselor_id) {
          if (formMode === 'treatment_target') {
            query.where('tt.counselor_id', data.counselor_id);
          } else {
            query.where('vuf.counselor_id', data.counselor_id);
          }
          
          // Get tenant_id for the counselor and filter by it
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            if (formMode === 'treatment_target') {
              query.where('tt.tenant_id', Number(tenantId[0].tenant_id));
            } else {
              query.where('vuf.tenant_id', Number(tenantId[0].tenant_id));
            }
          }
        }

        if (data.client_id) {
          if (formMode === 'treatment_target') {
            query.where('tt.client_id', data.client_id);
          } else {
            query.where('vuf.client_id', data.client_id);
          }
        }

        if (data.form_id) {
          if (formMode === 'treatment_target') {
            query.where('tt.form_id', data.form_id);
          } else {
            query.where('vuf.form_id', data.form_id);
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
              query.where('vuf.tenant_id', Number(tenantId[0].tenant_id));
            }
          }
        }
        
        // If counselor_id is provided, also filter by specific counselor
        if (data.counselor_id) {
          if (formMode === 'treatment_target') {
            query.where('tt.counselor_id', data.counselor_id);
          } else {
            query.where('vuf.counselor_id', data.counselor_id);
          }
        }
        
        if (data.start_date) {
          if (formMode === 'treatment_target') {
            query.andWhere('tt.intake_date', '>=', data.start_date);
          } else {
            query.andWhere('vuf.intake_date', '>=', data.start_date);
          }
        }

        if (data.end_date) {
          if (formMode === 'treatment_target') {
            query.andWhere('tt.intake_date', '<=', data.end_date);
          } else {
            query.andWhere('vuf.intake_date', '<=', data.end_date);
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
            query.where('vuf.tenant_id', Number(tenantId[0].tenant_id));
          }
        }
        
        if (formMode === 'treatment_target') {
          query.where('tt.counselor_id', data.counselor_id);
        } else {
          query.where('vuf.counselor_id', data.counselor_id);
        }
      }

      // Apply filtering to consent forms query based on role_id
      if (consentFormsQuery) {
        if (data.role_id == 2 && data.counselor_id) {
          // For role_id=2 (counselor), filter by counselor_id
          consentFormsQuery.where('vuf.counselor_id', Number(data.counselor_id));
          
          // Get tenant_id for the counselor and filter by it
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            consentFormsQuery.where('vuf.tenant_id', Number(tenantId[0].tenant_id));
          }
        } else if (data.role_id == 3 && data.tenant_id) {
          // For role_id=3 (manager), filter by tenant_id
          consentFormsQuery.where('vuf.tenant_id', Number(data.tenant_id));
        }
      }

      // Apply filtering to treatment target request forms query based on role_id
      if (requestFormsQuery) {
        if (data.role_id == 2 && data.counselor_id) {
          // For role_id=2 (counselor), filter by counselor_id
          requestFormsQuery.where('ttrf.counselor_id', Number(data.counselor_id));
          
          // Get tenant_id for the counselor and filter by it
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            requestFormsQuery.where('ttrf.tenant_id', Number(tenantId[0].tenant_id));
          }
        } else if (data.role_id == 3 && data.tenant_id) {
          // For role_id=3 (manager), filter by tenant_id
          requestFormsQuery.where('ttrf.tenant_id', Number(data.tenant_id));
        }
      }

      // Execute queries
      const [rec, consentForms, requestForms] = await Promise.all([
        query,
        consentFormsQuery ? consentFormsQuery : Promise.resolve([]),
        requestFormsQuery ? requestFormsQuery : Promise.resolve([])
      ]);

      // Combine results if we have treatment target forms, consent forms, and request forms
      let combinedResults = [...rec];
      if (consentForms && consentForms.length > 0) {
        combinedResults = [...combinedResults, ...consentForms];
      }
      if (requestForms && requestForms.length > 0) {
        combinedResults = [...combinedResults, ...requestForms];
      }

      // Filter out tenant consent forms for non-admin users
      // Tenant consent forms (where client has role_id = 3) should only be visible to admins (role_id = 4)
      if (data.role_id !== 4) {
        combinedResults = combinedResults.filter(form => {
          // If it's a consent form and the client is a tenant (role_id = 3), exclude it
          if (form.form_cde === 'CONSENT' && form.client_role_id === 3) {
            return false;
          }
          return true;
        });
      }

      // Sort combined results by date_sent
      combinedResults.sort((a, b) => new Date(b.date_sent) - new Date(a.date_sent));

      if (!combinedResults || combinedResults.length === 0) {
        return { message: 'No forms found', error: -1 };
      }

      return combinedResults;
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
          'thrpy_req_id',
          'session_id',
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
