import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';
import Common from './common.js';

export default class Report {
  ///////////////////////////////////////////
  constructor() {
    this.common = new Common();
  }
  //////////////////////////////////////////
  async getUserForm(data) {
    try {
      let query;
      let consentFormsQuery;
      let tenantConsentFormsQuery; // Separate query for tenant consent forms
      let intakeFormsQuery; // Query for client intake forms

      // Treatment target mode: query treatment target session forms
      query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms as tt')
        .join('user_profile as client', 'tt.client_id', 'client.user_profile_id')
        .join('user_profile as counselor', 'tt.counselor_id', 'counselor.user_profile_id')
        .join('forms as f', 'tt.form_id', 'f.form_id')
        .join('thrpy_req as tr', 'tt.req_id', 'tr.req_id')
        .leftJoin('session as s', 'tt.session_id', 's.session_id')
        .leftJoin('feedback as fb', function() {
          this.on('fb.form_id', '=', 'tt.form_id')
              .andOn(function() {
                this.on('fb.session_id', '=', 'tt.session_id')
                    .orOnNull('fb.session_id');
              });
        })
        // Include ALL forms from treatment_target_session_forms where is_sent = 1
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
        .andWhere('vuf.form_cde', 'CONSENT'); // Only get consent forms
      
      // Apply therapy request filtering only for non-admins
      // Admins (role_id = 4) see all consent forms including tenant consent forms
      if (data.role_id !== 4) {
        consentFormsQuery.andWhere(function() {
          // Always allow tenant consent forms (where client is a tenant)
          this.where(function() {
            this.where('client_user.role_id', 3);
          })
          .orWhere(function() {
            // For non-tenant consent forms, check therapy request status
            this.where(function() {
              this.where('tr.thrpy_status', '!=', 2).orWhereNull('tr.thrpy_status');
            })
            .orWhere(function() {
              // Also allow if there's an active therapy request via tr_active
              this.whereNotNull('tr_active.req_id');
            });
          });
        });
      }
      
      consentFormsQuery.groupBy([
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

      if (data.role_id === 2) {
        if (data.counselor_id) {
          query.where('tt.counselor_id', data.counselor_id);
          
          // Get tenant_id for the counselor and filter by it
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            query.where('tt.tenant_id', Number(tenantId[0].tenant_id));
          }
        }

        if (data.client_id) {
          query.where('tt.client_id', data.client_id);
        }

        if (data.form_id) {
          query.where('tt.form_id', data.form_id);
        }
      }

      if (data.role_id === 3) {
        // If the user is a manager, filter by tenant_id
        if (data.tenant_id) {
          // Use the provided tenant_id directly
          query.where('tt.tenant_id', Number(data.tenant_id));
        } else if (data.counselor_id) {
          // If no tenant_id provided but counselor_id is, get tenant_id from counselor
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            query.where('tt.tenant_id', Number(tenantId[0].tenant_id));
          }
        }
        
        // If counselor_id is provided, also filter by specific counselor
        if (data.counselor_id) {
          query.where('tt.counselor_id', data.counselor_id);
        }
        
        if (data.start_date) {
          query.andWhere('tt.intake_date', '>=', data.start_date);
        }

        if (data.end_date) {
          query.andWhere('tt.intake_date', '<=', data.end_date);
        }
      }

      // Handle other role_ids (like role_id === 4) - always include tenant_id when counselor_id is provided
      if (data.role_id !== 2 && data.role_id !== 3 && data.counselor_id) {
        const tenantId = await this.common.getUserTenantId({
          user_profile_id: data.counselor_id,
        });
        if (tenantId && !tenantId.error && tenantId.length > 0) {
          query.where('tt.tenant_id', Number(tenantId[0].tenant_id));
        }
        
        query.where('tt.counselor_id', data.counselor_id);
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
        } else if (data.role_id == 3) {
          // For role_id=3 (manager), filter by tenant_id
          if (data.tenant_id) {
          consentFormsQuery.where('vuf.tenant_id', Number(data.tenant_id));
          }
          
          // If counselor_id is provided, also filter by specific counselor
          if (data.counselor_id) {
            consentFormsQuery.where('vuf.counselor_id', Number(data.counselor_id));
          }
        } else if (data.role_id === 4) {
          // For role_id=4 (admin), show all consent forms including tenant consent forms
          // If counselor_id is provided, filter by it
          if (data.counselor_id) {
            consentFormsQuery.where('vuf.counselor_id', Number(data.counselor_id));
            
            // Get tenant_id for the counselor and filter by it
            const tenantId = await this.common.getUserTenantId({
              user_profile_id: data.counselor_id,
            });
            if (tenantId && !tenantId.error && tenantId.length > 0) {
              consentFormsQuery.where('vuf.tenant_id', Number(tenantId[0].tenant_id));
            }
          }
          // If no counselor_id provided, admin sees all consent forms (no additional filtering)
        } else if (data.role_id !== 2 && data.role_id !== 3 && data.counselor_id) {
          // For other roles, filter by counselor_id if provided
          consentFormsQuery.where('vuf.counselor_id', Number(data.counselor_id));
          
          // Get tenant_id for the counselor and filter by it
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            consentFormsQuery.where('vuf.tenant_id', Number(tenantId[0].tenant_id));
          }
        }
      }

      // For admins, also query tenant consent forms directly from user_forms table
      // Tenant consent forms might not be in v_user_form view if they don't have thrpy_req_id
      if (data.role_id === 4) {
        tenantConsentFormsQuery = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('user_forms as uf')
          .join('forms as f', 'uf.form_id', 'f.form_id')
          .join('user_profile as client', 'uf.client_id', 'client.user_profile_id')
          .join('user_profile as counselor', 'uf.counselor_id', 'counselor.user_profile_id')
          .leftJoin('users as client_user', 'client.user_id', 'client_user.user_id')
          .leftJoin('feedback as fb', function() {
            this.on('fb.form_id', '=', 'uf.form_id')
                .andOn('fb.client_id', '=', 'uf.client_id')
                .andOnNull('fb.session_id');
          })
          .select(
            'client.user_first_name as client_first_name',
            'client.user_last_name as client_last_name',
            'client.clam_num as client_clam_num',
            'uf.client_id',
            'uf.counselor_id',
            'uf.form_id',
            'f.form_cde as form_cde',
            db.raw('NULL as thrpy_req_id'), // Tenant consent forms don't have thrpy_req_id
            'uf.tenant_id',
            'uf.user_form_id',
            db.raw('MAX(fb.feedback_id) as feedback_id'),
            db.raw('MAX(uf.updated_at) as date_sent'),
            db.raw(`
                COALESCE(
                  DATE_ADD(MAX(uf.updated_at), INTERVAL 7 DAY),
                  DATE_ADD(MAX(uf.created_at), INTERVAL 7 DAY)
                ) as due_date
              `),
            'client_user.role_id as client_role_id',
          )
          .where('uf.is_sent', 1)
          .andWhere('client.status_yn', 'y')
          .andWhere('f.form_cde', 'CONSENT')
          .andWhere('client_user.role_id', 3) // Only get tenant consent forms (where client is a tenant)
          .groupBy([
            'client.user_first_name',
            'client.user_last_name',
            'client.clam_num',
            'uf.form_id',
            'f.form_cde',
            'uf.client_id',
            'uf.counselor_id',
            'uf.tenant_id',
            'uf.user_form_id',
            'client_user.role_id',
          ])
          .orderBy('date_sent', 'desc');
      }

      // Query for client intake forms where client_enrollment_id is null
      // Note: data.counselor_id is actually user_profile_id, so we need to join through counselor_profile
      if (data.counselor_id) {
        intakeFormsQuery = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('client_intake_form as cif')
          .join('counselor_profile as cp', 'cif.counselor_profile_id', 'cp.counselor_profile_id')
          .join('user_profile as counselor_up', 'cp.user_profile_id', 'counselor_up.user_profile_id')
          .select(
            db.raw("SUBSTRING_INDEX(cif.full_name, ' ', 1) as client_first_name"),
            db.raw("SUBSTRING_INDEX(cif.full_name, ' ', -1) as client_last_name"),
            db.raw('NULL as client_clam_num'), // Intake forms don't have clam_num
            db.raw('NULL as client_id'), // client_intake_form doesn't have client_id directly
            'counselor_up.user_profile_id as counselor_id', // Return user_profile_id as counselor_id to match expected format
            'cp.counselor_profile_id as counselor_profile_id', // Include counselor_profile_id for fetching intake form details
            db.raw('NULL as form_id'), // Intake form doesn't have a form_id
            db.raw("'INTAKE' as form_cde"), // Use a constant form code for intake forms
            db.raw('NULL as thrpy_req_id'), // Intake forms don't have thrpy_req_id
            'counselor_up.tenant_id as tenant_id',
            db.raw('NULL as feedback_id'), // Intake forms don't have feedback
            'cif.id as intake_form_id', // Include intake form ID
            'cif.created_at as date_sent',
            db.raw(`
                COALESCE(
                  DATE_ADD(cif.created_at, INTERVAL 7 DAY),
                  DATE_ADD(cif.updated_at, INTERVAL 7 DAY)
                ) as due_date
              `),
          )
          .whereNull('cif.client_enrollment_id')
          .where('counselor_up.user_profile_id', Number(data.counselor_id)); // Filter by user_profile_id

        // Apply tenant filtering if needed (similar to other queries)
        if (data.role_id === 2) {
          // Get tenant_id for the counselor and filter by it
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            intakeFormsQuery.where('counselor_up.tenant_id', Number(tenantId[0].tenant_id));
          }
        } else if (data.role_id === 3) {
          // For managers, filter by tenant_id if provided
          if (data.tenant_id) {
            intakeFormsQuery.where('counselor_up.tenant_id', Number(data.tenant_id));
          }
        } else if (data.role_id === 4 && data.counselor_id) {
          // For admins with counselor_id, get tenant_id
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            intakeFormsQuery.where('counselor_up.tenant_id', Number(tenantId[0].tenant_id));
          }
        } else if (data.role_id !== 2 && data.role_id !== 3 && data.counselor_id) {
          // For other roles with counselor_id
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            intakeFormsQuery.where('counselor_up.tenant_id', Number(tenantId[0].tenant_id));
          }
        }

        intakeFormsQuery.orderBy('date_sent', 'desc');
      }

      // Execute queries
      
      const [rec, consentForms, tenantConsentForms, intakeForms] = await Promise.all([
        query,
        consentFormsQuery ? consentFormsQuery : Promise.resolve([]),
        tenantConsentFormsQuery ? tenantConsentFormsQuery : Promise.resolve([]),
        intakeFormsQuery ? intakeFormsQuery : Promise.resolve([]),
      ]);


      // Combine results if we have treatment target forms and consent forms
      let combinedResults = [...rec];
      if (consentForms && consentForms.length > 0) {
        combinedResults = [...combinedResults, ...consentForms];
      }
      // Add tenant consent forms for admins
      if (tenantConsentForms && tenantConsentForms.length > 0) {
        combinedResults = [...combinedResults, ...tenantConsentForms];
      }
      // Add intake forms
      if (intakeForms && intakeForms.length > 0) {
        combinedResults = [...combinedResults, ...intakeForms];
      }

      // Remove duplicates across all form types
      // A form is considered duplicate if it has the same: client_id, counselor_id, form_id, thrpy_req_id
      // For consent forms, also check user_form_id to keep them unique
      // INTAKE forms are excluded from duplicate checking since they don't have client_id yet
      const formMap = new Map();
      const excludedIntakeForms = []; // Store INTAKE forms separately (excluded from duplicate check)
      
      // First pass: collect all forms and handle duplicates by keeping the most recent one
      combinedResults.forEach(form => {
        // Skip duplicate checking for INTAKE forms - they should all be included
        if (form.form_cde === 'INTAKE') {
          excludedIntakeForms.push(form);
          return;
        }
        
        // Create a unique key for each form
        // For consent forms, include user_form_id to keep them unique
        const uniqueKey = form.user_form_id 
          ? `${form.client_id}_${form.counselor_id}_${form.form_id}_${form.thrpy_req_id}_${form.user_form_id}`
          : `${form.client_id}_${form.counselor_id}_${form.form_id}_${form.thrpy_req_id}`;
        
        if (formMap.has(uniqueKey)) {
          // If duplicate found, keep the one with the most recent date_sent
          const existingForm = formMap.get(uniqueKey);
          const existingDate = new Date(existingForm.date_sent || 0);
          const currentDate = new Date(form.date_sent || 0);
          
          if (currentDate > existingDate) {
            // Current form is newer, replace the existing one
            formMap.set(uniqueKey, form);
          }
          // Otherwise, keep the existing form (already in map)
        } else {
          // First occurrence of this form, add it to map
          formMap.set(uniqueKey, form);
        }
      });
      
      // Convert map values back to array and add INTAKE forms back (without duplicate checking)
      combinedResults = [...Array.from(formMap.values()), ...excludedIntakeForms];

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
        .andWhere('thrpy_status', '!=', 2) // Exclude DISCHARGED
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
             AND COALESCE(is_report, 0) != 1
             AND COALESCE(is_additional, 0) != 1) as show_session_count
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
             AND COALESCE(is_report, 0) != 1
             AND COALESCE(is_additional, 0) != 1) as no_show_session_count
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
             WHERE COALESCE(status, '') != 'INACTIVE'
             AND COALESCE(is_report, 0) != 1 
             AND COALESCE(is_additional, 0) != 1) as total_session_count
          `)
        )
        .whereIn('thrpy_status', ['ONGOING', 'PAUSED', 1, 3])
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

  //////////////////////////////////////////
  async getSessionsWithHomeworkStats(data) {

    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session as s')
        .leftJoin('homework as h', 's.session_id', 'h.session_id')
        .select(
          's.thrpy_req_id',
          's.client_id',
          's.client_first_name',
          's.client_last_name',
          's.counselor_id',
          's.tenant_id',
          db.raw('COUNT(DISTINCT s.session_id) as total_sessions'),
          db.raw('COUNT(h.homework_id) as total_homework_sent'),
          db.raw('MIN(s.intake_date) as first_session_date'),
          db.raw('MAX(s.intake_date) as last_session_date')
        )
        .where('s.status_yn', 'y')
        .whereIn('s.thrpy_status', ['ONGOING', 'PAUSED', 1, 3]) // Include ONGOING and PAUSED (string and numeric)
        .groupBy(
          's.thrpy_req_id',
          's.client_id',
          's.client_first_name',
          's.client_last_name',
          's.counselor_id',
          's.tenant_id'
        )
        .orderBy('last_session_date', 'desc');

      // Apply filters based on role
      switch (data.role_id) {
        case 2: {
          // Counselor role - MUST have counselor_id and MUST filter by tenant
          if (!data.counselor_id) {
            return { message: 'counselor_id is required for counselor role', error: -1 };
          }

          query.andWhere('s.counselor_id', data.counselor_id);
          
          // Get tenant_id for the counselor and filter by it (REQUIRED for counselors)
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            query.andWhere('s.tenant_id', Number(tenantId[0].tenant_id));
          } else {
            // If we can't get tenant_id, return error to prevent cross-tenant access
            return { message: 'Unable to determine tenant for counselor', error: -1 };
          }

          if (data.client_id) {
            query.andWhere('s.client_id', data.client_id);
          }
          break;
        }

        case 3: {
          // Manager role - MUST filter by tenant (either provided or derived from counselor_id)
          if (data.tenant_id) {
            // Use the provided tenant_id directly
            query.andWhere('s.tenant_id', Number(data.tenant_id));
          } else if (data.counselor_id) {
            // If no tenant_id provided but counselor_id is, get tenant_id from counselor
            const tenantId = await this.common.getUserTenantId({
              user_profile_id: data.counselor_id,
            });
            if (tenantId && !tenantId.error && tenantId.length > 0) {
              query.andWhere('s.tenant_id', Number(tenantId[0].tenant_id));
            } else {
              // If we can't get tenant_id, return error to prevent cross-tenant access
              return { message: 'Unable to determine tenant for counselor', error: -1 };
            }
          } else {
            // Manager role requires either tenant_id or counselor_id - return error if both missing
            return { message: 'tenant_id or counselor_id is required for manager role', error: -1 };
          }
          
          // If counselor_id is provided, also filter by specific counselor
          if (data.counselor_id) {
            query.andWhere('s.counselor_id', data.counselor_id);
          }

          if (data.start_date) {
            query.andWhere('s.intake_date', '>=', data.start_date);
          }

          if (data.end_date) {
            query.andWhere('s.intake_date', '<=', data.end_date);
          }
          break;
        }

        case 4:
        default: {
          // For admin (role_id === 4) or other roles, if counselor_id is provided, filter by that counselor's tenant
          // If no counselor_id, admin can see all tenants (intentional)
          if (data.counselor_id) {
            const tenantId = await this.common.getUserTenantId({
              user_profile_id: data.counselor_id,
            });
            if (tenantId && !tenantId.error && tenantId.length > 0) {
              query.andWhere('s.tenant_id', Number(tenantId[0].tenant_id));
            }
            query.andWhere('s.counselor_id', data.counselor_id);
          }
          
          if (data.start_date) {
            query.andWhere('s.intake_date', '>=', data.start_date);
          }

          if (data.end_date) {
            query.andWhere('s.intake_date', '<=', data.end_date);
          }
          break;
        }
      }

      const rec = await query;

      if (!rec) {
        logger.error('Error getting sessions with homework stats');
        return { message: 'Error getting sessions with homework stats', error: -1 };
      }

      return rec;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting sessions with homework stats', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getProgressReportData(data) {
    try {
      const { thrpy_req_id, session_id } = data;

      if (!thrpy_req_id) {
        return { message: 'thrpy_req_id is required', error: -1 };
      }

      // Get therapy request data (similar to emailTmplt.js logic)
      const ThrpyReq = (await import('./thrpyReq.js')).default;
      const thrpyReqModel = new ThrpyReq();
      const recThrpy = await thrpyReqModel.getThrpyReqById({ req_id: thrpy_req_id });

      if (!recThrpy || recThrpy.length === 0 || recThrpy.error) {
        return { message: 'Therapy request not found', error: -1 };
      }

      const therapyRequest = recThrpy[0];

      // Get client information
      const recUser = await this.common.getUserProfileByUserProfileId(
        therapyRequest.client_id
      );

      if (!recUser || recUser.length === 0) {
        return { message: 'Client not found', error: -1 };
      }

      // Get tenant information
      const tenantId = therapyRequest.tenant_id;
      let tenantName = 'N/A';
      if (tenantId) {
        const tenantQuery = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('tenant')
          .where('tenant_id', tenantId)
          .select('tenant_name')
          .first();
        
        if (tenantQuery) {
          tenantName = tenantQuery.tenant_name;
        }
      }

      // Get counselor information
      const counselorInfo = await this.common.getUserProfileByUserProfileId(
        therapyRequest.counselor_id
      );

      if (!counselorInfo || counselorInfo.length === 0) {
        return { message: 'Counselor not found', error: -1 };
      }

      // Get counselor designation (if available from counselor_profile)
      let counselorDesignation = 'Therapist';
      try {
        const counselorProfileQuery = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('counselor_profile')
          .where('user_profile_id', therapyRequest.counselor_id)
          .select('profile_notes')
          .first();
        
        // You might need to parse profile_notes or have a separate designation field
        // For now, using default
      } catch (error) {
        logger.error('Error fetching counselor designation:', error);
      }

      // Find the progress report session
      let progressReportSession = null;
      if (session_id) {
        // If session_id is provided, find that specific session
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          progressReportSession = therapyRequest.session_obj.find(
            (s) => s.session_id === session_id && (s.is_report === 1 || s.service_code === 'PR')
          );
        }
      } else {
        // Otherwise, find the first progress report session
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          progressReportSession = therapyRequest.session_obj.find(
            (s) => s.is_report === 1 && (s.service_code === 'PR' || s.service_code?.includes('PR'))
          );
        }
      }

      if (!progressReportSession) {
        return { message: 'Progress report session not found', error: -1 };
      }

      // Calculate total sessions and completed sessions (similar to emailTmplt.js logic)
      let totalSessions = 0;
      let totalSessionsCompleted = 0;
      
      if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
        // Sort sessions by session_id
        const sortedSessions = [...therapyRequest.session_obj].sort(
          (a, b) => a.session_id - b.session_id
        );

        // Remove reports sessions and inactive sessions
        const removeReportsSessions = sortedSessions.filter(
          (session) => session.is_report !== 1 && session.session_status !== 'INACTIVE'
        );

        // Filter sessions up to the progress report session (if session_id is provided)
        // Otherwise, count all sessions
        let filteredSessions = removeReportsSessions;
        if (session_id && progressReportSession.session_id) {
          filteredSessions = removeReportsSessions.filter(
            (session) => session.session_id <= progressReportSession.session_id
          );
        }

        // Calculate total sessions (excluding reports and inactive)
        totalSessions = filteredSessions.length;

        // Count completed sessions (status === 'SHOW')
        totalSessionsCompleted = filteredSessions.filter(
          (session) => session.session_status === 'SHOW'
        ).length;
      }

      // Get frequency from service
      const serviceName = therapyRequest.service_name || '';
      const frequency = serviceName.toLowerCase().includes('weekly')
        ? 'Weekly'
        : serviceName.toLowerCase().includes('biweekly')
        ? 'Biweekly'
        : 'Other';

      // Get assessments/feedback from all sessions in the therapy request (excluding report sessions)
      // Get the most recent assessments up to the progress report session
      let assessments = [];
      try {
        // Get all session IDs from the therapy request (excluding report sessions and inactive)
        const sessionIds = therapyRequest.session_obj
          ? therapyRequest.session_obj
              .filter(
                (s) =>
                  s.is_report !== 1 &&
                  s.session_status !== 'INACTIVE' &&
                  (!session_id || s.session_id <= progressReportSession.session_id)
              )
              .map((s) => s.session_id)
          : [];

        if (sessionIds.length > 0) {
          const feedbackQuery = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('feedback as fb')
            .leftJoin('forms as f', 'fb.form_id', 'f.form_id')
            .leftJoin('session as s', 'fb.session_id', 's.session_id')
            .leftJoin('feedback_phq9 as phq9', 'fb.feedback_id', 'phq9.feedback_id')
            .leftJoin('feedback_gad as gad', 'fb.feedback_id', 'gad.feedback_id')
            .leftJoin('feedback_pcl5 as pcl5', 'fb.feedback_id', 'pcl5.feedback_id')
            .leftJoin('feedback_whodas as whodas', 'fb.feedback_id', 'whodas.feedback_id')
            .whereIn('fb.session_id', sessionIds)
            .andWhere('fb.status_yn', 'y')
            .andWhere('s.is_report', 0) // Exclude report sessions
            .andWhere('f.form_cde', '!=', 'SESSION SUM REPORT') // Exclude attendance forms
            .select(
              'fb.feedback_id',
              'fb.session_id',
              'fb.form_id',
              'f.form_cde',
              'phq9.total_score as phq9_score',
              'gad.total_points as gad_score',
              'pcl5.total_score as pcl5_score',
              'whodas.overallScore as whodas_score',
              'fb.created_at'
            )
            .orderBy('fb.created_at', 'desc')
            .limit(5);

          assessments = feedbackQuery.map((fb) => {
            let score = 'N/A';
            if (fb.phq9_score !== null && fb.phq9_score !== undefined) {
              score = fb.phq9_score.toString();
            } else if (fb.gad_score !== null && fb.gad_score !== undefined) {
              score = fb.gad_score.toString();
            } else if (fb.pcl5_score !== null && fb.pcl5_score !== undefined) {
              score = fb.pcl5_score.toString();
            } else if (fb.whodas_score !== null && fb.whodas_score !== undefined) {
              score = fb.whodas_score.toString();
            }

            return {
              feedback_id: fb.feedback_id,
              form_id: fb.form_id,
              form_cde: fb.form_cde,
              score: score,
            };
          });
        }
      } catch (error) {
        logger.error('Error fetching assessments:', error);
        assessments = [];
      }

      // Build response object with all data except therapist-filled fields
      const response = {
        // Practice information
        tenant_name: tenantName,
        tenant_id: tenantId,

        // Therapist information
        counselor_first_name: counselorInfo[0].user_first_name,
        counselor_last_name: counselorInfo[0].user_last_name,
        counselor_designation: counselorDesignation,
        counselor_id: therapyRequest.counselor_id,

        // Client information
        client_first_name: recUser[0].user_first_name,
        client_last_name: recUser[0].user_last_name,
        client_clam_num: recUser[0].clam_num,
        client_id: therapyRequest.client_id,

        // Session information
        session_id: progressReportSession.session_id,
        session_number: progressReportSession.session_number,
        session_date: progressReportSession.intake_date,
        scheduled_time: progressReportSession.scheduled_time,

        // Therapy request information
        thrpy_req_id: thrpy_req_id,
        treatment_target: therapyRequest.treatment_target,
        service_name: therapyRequest.service_name,
        service_code: progressReportSession.service_code,

        // Calculated fields
        total_sessions: totalSessions,
        total_sessions_completed: totalSessionsCompleted,
        frequency: frequency,

        // Assessments
        assessments: assessments,

        // Note: The following fields are NOT included as they will be filled by therapist:
        // - session_summary
        // - progress_since_last_session
        // - risk_screening_note
        // - therapist_notes (for each assessment)
      };

      return response;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting progress report data', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getDischargeReportData(data) {
    try {
      const { thrpy_req_id, session_id } = data;

      if (!thrpy_req_id) {
        return { message: 'thrpy_req_id is required', error: -1 };
      }

      // Get therapy request data (similar to progress report logic)
      const ThrpyReq = (await import('./thrpyReq.js')).default;
      const thrpyReqModel = new ThrpyReq();
      const recThrpy = await thrpyReqModel.getThrpyReqById({ req_id: thrpy_req_id });

      if (!recThrpy || recThrpy.length === 0 || recThrpy.error) {
        return { message: 'Therapy request not found', error: -1 };
      }

      const therapyRequest = recThrpy[0];

      // Get client information
      const recUser = await this.common.getUserProfileByUserProfileId(
        therapyRequest.client_id
      );

      if (!recUser || recUser.length === 0) {
        return { message: 'Client not found', error: -1 };
      }

      // Get tenant information
      const tenantId = therapyRequest.tenant_id;
      let tenantName = 'N/A';
      if (tenantId) {
        const tenantQuery = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('tenant')
          .where('tenant_id', tenantId)
          .select('tenant_name')
          .first();
        
        if (tenantQuery) {
          tenantName = tenantQuery.tenant_name;
        }
      }

      // Get counselor information
      const counselorInfo = await this.common.getUserProfileByUserProfileId(
        therapyRequest.counselor_id
      );

      if (!counselorInfo || counselorInfo.length === 0) {
        return { message: 'Counselor not found', error: -1 };
      }

      // Get counselor designation
      let counselorDesignation = 'Therapist';
      try {
        const counselorProfileQuery = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('counselor_profile')
          .where('user_profile_id', therapyRequest.counselor_id)
          .select('profile_notes')
          .first();
      } catch (error) {
        logger.error('Error fetching counselor designation:', error);
      }

      // Find the discharge report session
      let dischargeReportSession = null;
      if (session_id) {
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          dischargeReportSession = therapyRequest.session_obj.find(
            (s) => s.session_id === session_id && (s.is_report === 1 || s.service_code === 'DR')
          );
        }
      } else {
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          dischargeReportSession = therapyRequest.session_obj.find(
            (s) => s.is_report === 1 && (s.service_code === 'DR' || s.service_code?.includes('DR'))
          );
        }
      }

      if (!dischargeReportSession) {
        return { message: 'Discharge report session not found', error: -1 };
      }

      // Calculate total sessions and completed sessions
      let totalSessions = 0;
      let totalSessionsCompleted = 0;
      
      if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
        const sortedSessions = [...therapyRequest.session_obj].sort(
          (a, b) => a.session_id - b.session_id
        );

        const removeReportsSessions = sortedSessions.filter(
          (session) => session.is_report !== 1 && session.session_status !== 'INACTIVE'
        );

        let filteredSessions = removeReportsSessions;
        if (session_id && dischargeReportSession.session_id) {
          filteredSessions = removeReportsSessions.filter(
            (session) => session.session_id <= dischargeReportSession.session_id
          );
        }

        totalSessions = filteredSessions.length;
        totalSessionsCompleted = filteredSessions.filter(
          (session) => session.session_status === 'SHOW'
        ).length;
      }

      // Get frequency from service
      const serviceName = therapyRequest.service_name || '';
      const frequency = serviceName.toLowerCase().includes('weekly')
        ? 'Weekly'
        : serviceName.toLowerCase().includes('biweekly')
        ? 'Biweekly'
        : 'Other';

      // Get assessments/feedback from all sessions in the therapy request
      let assessments = [];
      try {
        const sessionIds = therapyRequest.session_obj
          ? therapyRequest.session_obj
              .filter(
                (s) =>
                  s.is_report !== 1 &&
                  s.session_status !== 'INACTIVE' &&
                  (!session_id || s.session_id <= dischargeReportSession.session_id)
              )
              .map((s) => s.session_id)
          : [];

        if (sessionIds.length > 0) {
          const feedbackQuery = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('feedback as fb')
            .leftJoin('forms as f', 'fb.form_id', 'f.form_id')
            .leftJoin('session as s', 'fb.session_id', 's.session_id')
            .leftJoin('feedback_phq9 as phq9', 'fb.feedback_id', 'phq9.feedback_id')
            .leftJoin('feedback_gad as gad', 'fb.feedback_id', 'gad.feedback_id')
            .leftJoin('feedback_pcl5 as pcl5', 'fb.feedback_id', 'pcl5.feedback_id')
            .leftJoin('feedback_whodas as whodas', 'fb.feedback_id', 'whodas.feedback_id')
            .whereIn('fb.session_id', sessionIds)
            .andWhere('fb.status_yn', 'y')
            .andWhere('s.is_report', 0)
            .andWhere('f.form_cde', '!=', 'SESSION SUM REPORT')
            .select(
              'fb.feedback_id',
              'fb.session_id',
              'fb.form_id',
              'f.form_cde',
              'phq9.total_score as phq9_score',
              'gad.total_points as gad_score',
              'pcl5.total_score as pcl5_score',
              'whodas.overallScore as whodas_score',
              'fb.created_at'
            )
            .orderBy('fb.created_at', 'desc')
            .limit(5);

          assessments = feedbackQuery.map((fb) => {
            let score = 'N/A';
            if (fb.phq9_score !== null && fb.phq9_score !== undefined) {
              score = fb.phq9_score.toString();
            } else if (fb.gad_score !== null && fb.gad_score !== undefined) {
              score = fb.gad_score.toString();
            } else if (fb.pcl5_score !== null && fb.pcl5_score !== undefined) {
              score = fb.pcl5_score.toString();
            } else if (fb.whodas_score !== null && fb.whodas_score !== undefined) {
              score = fb.whodas_score.toString();
            }

            return {
              feedback_id: fb.feedback_id,
              form_id: fb.form_id,
              form_cde: fb.form_cde,
              score: score,
            };
          });
        }
      } catch (error) {
        logger.error('Error fetching assessments:', error);
        assessments = [];
      }

      // Build response object with all data except therapist-filled fields
      const response = {
        // Practice information
        tenant_name: tenantName,
        tenant_id: tenantId,

        // Therapist information
        counselor_first_name: counselorInfo[0].user_first_name,
        counselor_last_name: counselorInfo[0].user_last_name,
        counselor_designation: counselorDesignation,
        counselor_id: therapyRequest.counselor_id,

        // Client information
        client_first_name: recUser[0].user_first_name,
        client_last_name: recUser[0].user_last_name,
        client_clam_num: recUser[0].clam_num,
        client_id: therapyRequest.client_id,

        // Session information
        session_id: dischargeReportSession.session_id,
        session_number: dischargeReportSession.session_number,
        session_date: dischargeReportSession.intake_date,
        scheduled_time: dischargeReportSession.scheduled_time,

        // Therapy request information
        thrpy_req_id: thrpy_req_id,
        treatment_target: therapyRequest.treatment_target,
        service_name: therapyRequest.service_name,
        service_code: dischargeReportSession.service_code,

        // Calculated fields
        total_sessions: totalSessions,
        total_sessions_completed: totalSessionsCompleted,
        frequency: frequency,

        // Assessments
        assessments: assessments,

        // Note: The following fields are NOT included as they will be filled by therapist:
        // - treatment_summary
        // - treatment_outcomes
        // - discharge_reason
        // - recommendations
        // - therapist_notes (for each assessment)
      };

      return response;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting discharge report data', error: -1 };
    }
  }
}
