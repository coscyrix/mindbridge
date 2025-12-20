import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';
import prisma from '../utils/prisma.js';

export default class TreatmentTargetFeedbackConfig {
  //////////////////////////////////////////
  constructor() {
    // Initialize the model
  }
  //////////////////////////////////////////

  /**
   * Helper function to parse sessions array from various formats
   * @param {*} sessions - Sessions data (can be array, string, or other)
   * @param {string} context - Context for logging (e.g., "frequency 123" or "form_name")
   * @returns {Array} Parsed sessions array
   */
  parseSessionsArray(sessions, context = '') {
    if (Array.isArray(sessions)) {
      return sessions;
    }

    if (typeof sessions === 'string') {
      try {
        const parsed = JSON.parse(sessions);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        logger.warn(`Parsed sessions is not an array for ${context}:`, typeof parsed);
        return [];
      } catch (e) {
        logger.error(`Failed to parse sessions for ${context}:`, sessions);
        return [];
      }
    }

    logger.warn(`Sessions is not an array for ${context}:`, typeof sessions);
    return [];
  }

  //////////////////////////////////////////

  /**
   * Check if a combination of treatment_target, form_name, and service_name already exists
   * @param {Object} data - Check data
   * @param {string} data.treatment_target - Treatment target
   * @param {string} data.form_name - Form name
   * @param {string|null} data.service_name - Service name (optional)
   * @param {number|null} data.tenant_id - Tenant ID
   * @param {number|null} data.exclude_id - ID to exclude from check (for updates)
   */
  async checkExistingCombination(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('treatment_target', data.treatment_target)
        .where('form_name', data.form_name);

      // Add service_name condition
      if (data.service_name !== null && data.service_name !== undefined) {
        query = query.where('service_name', data.service_name);
      } else {
        query = query.whereNull('service_name');
      }

      // If tenant_id is provided, check for tenant-specific combination
      if (data.tenant_id !== null && data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      } else {
        // If tenant_id is null, check for global combination (tenant_id is null)
        query = query.whereNull('tenant_id');
      }

      // Exclude current record if updating
      if (data.exclude_id) {
        query = query.whereNot('id', data.exclude_id);
      }

      const existingConfig = await query.first();

      return existingConfig ? true : false;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  //////////////////////////////////////////

  /**
   * Create a new treatment target feedback configuration
   * @param {Object} data - Configuration data
   * @param {string} data.treatment_target - Treatment target (e.g., "Anxiety", "Depression")
   * @param {string} data.form_name - Form name (e.g., "GAD-7", "PHQ-9")
   * @param {string|null} data.service_name - Service name (optional)
   * @param {string} data.purpose - Purpose description
   * @param {Array} data.sessions - Array of session numbers or special values
   * @param {number|null} data.tenant_id - Tenant ID (nullable)
   */
  async postTreatmentTargetFeedbackConfig(data) {
    try {
      // Check for existing combination
      const existingCombination = await this.checkExistingCombination({
        treatment_target: data.treatment_target,
        form_name: data.form_name,
        service_name: data.service_name || null,
        tenant_id: data.tenant_id || null,
      });

      if (existingCombination) {
        const tenantInfo = data.tenant_id
          ? ` for tenant ${data.tenant_id}`
          : ' globally';
        const serviceInfo = data.service_name
          ? ` and service "${data.service_name}"`
          : '';
        return {
          message: `Configuration with treatment_target "${data.treatment_target}", form_name "${data.form_name}"${serviceInfo} already exists${tenantInfo}`,
          error: -1,
        };
      }

      const tmpConfig = {
        treatment_target: data.treatment_target,
        form_name: data.form_name,
        service_name: data.service_name || null,
        purpose: data.purpose,
        sessions: db.raw('?', [JSON.stringify(data.sessions)]), // Use raw SQL for JSON column
        tenant_id: data.tenant_id || null,
      };

      const postConfig = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .insert(tmpConfig);

      if (!postConfig) {
        logger.error('Error creating treatment target feedback config');
        return {
          message: 'Error creating treatment target feedback config',
          error: -1,
        };
      }

      return {
        message: 'Treatment target feedback config created successfully',
        rec: postConfig,
      };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return {
        message: 'Error creating treatment target feedback config',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target feedback configuration by ID
   * @param {Object} data - Update data
   * @param {number} data.id - Configuration ID
   * @param {string} data.treatment_target - Treatment target
   * @param {string} data.form_name - Form name
   * @param {string|null} data.service_name - Service name (optional)
   * @param {string} data.purpose - Purpose description
   * @param {Array} data.sessions - Array of session numbers
   * @param {number|null} data.tenant_id - Tenant ID
   */
  async putTreatmentTargetFeedbackConfigById(data) {
    try {
      // Check for existing combination (excluding current record)
      const existingCombination = await this.checkExistingCombination({
        treatment_target: data.treatment_target,
        form_name: data.form_name,
        service_name: data.service_name || null,
        tenant_id: data.tenant_id || null,
        exclude_id: data.id,
      });

      if (existingCombination) {
        const tenantInfo = data.tenant_id
          ? ` for tenant ${data.tenant_id}`
          : ' globally';
        const serviceInfo = data.service_name
          ? ` and service "${data.service_name}"`
          : '';
        return {
          message: `Configuration with treatment_target "${data.treatment_target}", form_name "${data.form_name}"${serviceInfo} already exists${tenantInfo}`,
          error: -1,
        };
      }

      const tmpConfig = {
        treatment_target: data.treatment_target,
        form_name: data.form_name,
        service_name: data.service_name || null,
        purpose: data.purpose,
        sessions: db.raw('?', [JSON.stringify(data.sessions)]), // Use raw SQL for JSON column
        tenant_id: data.tenant_id || null,
      };

      const putConfig = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('id', data.id)
        .update(tmpConfig);

      if (!putConfig) {
        logger.error('Error updating treatment target feedback config');
        return {
          message: 'Error updating treatment target feedback config',
          error: -1,
        };
      }

      return {
        message: 'Treatment target feedback config updated successfully',
      };
    } catch (error) {
      logger.error(error);
      return {
        message: 'Error updating treatment target feedback config',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target feedback configuration by ID
   * @param {Object} data - Query data
   * @param {number} data.id - Configuration ID
   */
  async getTreatmentTargetFeedbackConfigById(data) {
    try {
      const config = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('id', data.id)
        .first();

      if (!config) {
        return {
          message: 'Treatment target feedback config not found',
          error: -1,
        };
      }

      // sessions is already a JSON object from the database, no parsing needed

      return {
        message: 'Treatment target feedback config retrieved successfully',
        rec: config,
      };
    } catch (error) {
      logger.error(error);
      return {
        message: 'Error retrieving treatment target feedback config',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all treatment target feedback configurations
   * @param {Object} data - Query data
   * @param {string} data.treatment_target - Filter by treatment target
   * @param {string} data.form_name - Filter by form name
   * @param {string} data.service_name - Filter by service name
   * @param {number} data.tenant_id - Filter by tenant ID
   */
  async getTreatmentTargetFeedbackConfigs(data = {}) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config');

      if (data.treatment_target) {
        query = query.where('treatment_target', data.treatment_target);
      }

      if (data.form_name) {
        query = query.where('form_name', data.form_name);
      }

      if (data.service_name !== undefined) {
        if (data.service_name === null) {
          query = query.whereNull('service_name');
        } else {
          query = query.where('service_name', data.service_name);
        }
      }

      if (data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      }

      const configs = await query
        .orderBy('treatment_target', 'asc')
        .orderBy('form_name', 'asc')
        .orderBy('service_name', 'asc');

      // sessions is already a JSON object from the database, no parsing needed

      return {
        message: 'Treatment target feedback configs retrieved successfully',
        rec: configs,
      };
    } catch (error) {
      console.log('error-------->', error);

      logger.error(error);
      return {
        message: 'Error retrieving treatment target feedback configs',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Check if a session should trigger a feedback form for a specific treatment target
   * @param {Object} data - Check data
   * @param {string} data.treatment_target - Treatment target
   * @param {number} data.session_number - Current session number
   * @param {number} data.tenant_id - Tenant ID
   * @returns {Array} Array of forms that should be sent for this session
   */
  async checkSessionFeedbackForms(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('treatment_target', data.treatment_target);

      if (data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      }

      const configs = await query;

      const formsToSend = [];

      for (const config of configs) {
        // sessions is already a JSON object from the database, no parsing needed
        const sessions = config.sessions;

        // Check if current session number is in the sessions array
        if (sessions.includes(data.session_number)) {
          formsToSend.push({
            form_name: config.form_name,
            purpose: config.purpose,
            config_id: config.id,
          });
        }
      }

      return {
        message: 'Session feedback forms check completed',
        rec: formsToSend,
        session_number: data.session_number,
        treatment_target: data.treatment_target,
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error checking session feedback forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Delete treatment target feedback configuration by ID
   * @param {Object} data - Delete data
   * @param {number} data.id - Configuration ID
   */
  async deleteTreatmentTargetFeedbackConfigById(data) {
    try {
      const deleteConfig = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('id', data.id)
        .del();

      if (!deleteConfig) {
        logger.error('Error deleting treatment target feedback config');
        return {
          message: 'Error deleting treatment target feedback config',
          error: -1,
        };
      }

      return {
        message: 'Treatment target feedback config deleted successfully',
      };
    } catch (error) {
      logger.error(error);
      return {
        message: 'Error deleting treatment target feedback config',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all unique treatment targets
   */
  async getTreatmentTargets() {
    try {
      const targets = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .distinct('treatment_target')
        .orderBy('treatment_target', 'asc');

      return {
        message: 'Treatment targets retrieved successfully',
        rec: targets.map((t) => t.treatment_target),
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving treatment targets', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all unique form names
   */
  async getFormNames() {
    try {
      const forms = await prisma.forms.findMany({
        where: {
          status_yn: 'y',
        },
        select: {
          form_cde: true,
        },
        orderBy: {
          form_cde: 'asc',
        },
      });

      return {
        message: 'Form names retrieved successfully',
        rec: forms.map((f) => f.form_cde),
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving form names', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all unique service names
   */
  async getServiceNames() {
    try {
      const services = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .distinct('service_name')
        .whereNotNull('service_name')
        .orderBy('service_name', 'asc');

      return {
        message: 'Service names retrieved successfully',
        rec: services.map((s) => s.service_name),
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving service names', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Load session forms based on treatment target for a therapy request

   * 
   * Template-based system that supports service-specific session frequencies.
   * 
   * @param {Object} data - Request data
   * @param {number} data.req_id - Therapy request ID
   * @param {string} data.treatment_target - Treatment target
   * @param {number} data.tenant_id - Tenant ID
   * @param {number} data.number_of_sessions - Number of sessions
   */
  async loadSessionFormsByTreatmentTarget(data) {
    try {
      // Get therapy request details
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_thrpy_req')
        .where('req_id', data.req_id);

      const [rec] = await query;

      if (!rec) {
        logger.error(
          'Error getting therapy request for treatment target form loading',
        );
        return { message: 'Error getting therapy request', error: -1 };
      }

      // Get service details to find service template
      const service = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service')
        .where('service_id', rec.service_id)
        .first();

      if (!service) {
        logger.error('Service not found for therapy request');
        return { message: 'Service not found', error: -1 };
      }

      // Find matching service template by service_code
      // Try exact match first, then try case-insensitive
      let serviceTemplate = await prisma.service_templates.findFirst({
        where: {
          service_code: service.service_code,
          status_yn: 'y',
        },
      });

      // If not found, try case-insensitive search
      if (!serviceTemplate) {
        const allTemplates = await prisma.service_templates.findMany({
          where: {
            status_yn: 'y',
          },
        });
        
        serviceTemplate = allTemplates.find(
          t => t.service_code.toUpperCase() === service.service_code.toUpperCase()
        );
      }

      const serviceTemplateId = serviceTemplate?.template_service_id || null;
      // Use number_of_sessions from data or rec if available, otherwise fall back to service.nbr_of_sessions
      // This matches the logic in thrpyReq.js line 343 to ensure Priority 1 matching works correctly
      const nbrOfSessions = (data.number_of_sessions ? Number(data.number_of_sessions) : 
                             (rec.number_of_sessions ? Number(rec.number_of_sessions) : service.nbr_of_sessions));

      logger.info(`Service lookup - service_code: ${service.service_code}, service_template_id: ${serviceTemplateId}, nbr_of_sessions: ${nbrOfSessions} (from data.number_of_sessions: ${data.number_of_sessions}, rec.number_of_sessions: ${rec.number_of_sessions}, service.nbr_of_sessions: ${service.nbr_of_sessions})`);
      
      if (!serviceTemplate) {
        logger.warn(`Service template not found for service_code: ${service.service_code}. Will use default frequencies (service_ref_id = null)`);
      }

      // Get treatment target templates with service frequencies using NEW template system
      // Get all frequencies first, then filter/prioritize in code for better matching
      const templates = await prisma.treatment_target_session_forms_template.findMany({
        where: {
          treatment_target: data.treatment_target,
          is_active: true,
        },
        include: {
          service_frequencies: {
            where: {
              OR: [
                { service_ref_id: serviceTemplateId },
                { service_ref_id: null }, // Default frequencies
              ],
            },
            include: {
              service_template: {
                select: {
                  template_service_id: true,
                  service_name: true,
                  service_code: true,
                },
              },
            },
            orderBy: [
              { service_ref_id: 'asc' }, // Prefer service-specific over null
              { nbr_of_sessions: 'asc' },
            ],
          },
        },
      });

      if (!templates || templates.length === 0) {
        logger.error('No treatment target templates found');
        return {
          message: 'No treatment target templates found',
          error: -1,
        };
      }

      // Build configs array from templates and their frequencies
      const configs = [];
      
      for (const template of templates) {
        logger.info(`🔍 Matching frequency for template: ${template.form_name} (template_id: ${template.id})`);
        logger.info(`   Looking for: service_template_id=${serviceTemplateId}, nbr_of_sessions=${nbrOfSessions}`);
        logger.info(`   Available frequencies: ${template.service_frequencies.length}`);
        
        // Log available frequencies for debugging
        template.service_frequencies.forEach((f, idx) => {
          logger.info(`   Frequency ${idx + 1}: service_ref_id=${f.service_ref_id}, nbr_of_sessions=${f.nbr_of_sessions}, sessions=[${Array.isArray(f.sessions) ? f.sessions.join(', ') : f.sessions}]`);
        });

        // Prioritize frequency matching:
        // 1. Service-specific with exact nbr_of_sessions
        // 2. Service-specific with any nbr_of_sessions
        // 3. Default (null) with exact nbr_of_sessions
        // 4. Default (null) with any nbr_of_sessions
        let frequency = template.service_frequencies.find(
          f => f.service_ref_id === serviceTemplateId && f.nbr_of_sessions === nbrOfSessions
        );
        
        if (frequency) {
          logger.info(`   ✅ Matched: Priority 1 - Service-specific + exact nbr_of_sessions (frequency_id: ${frequency.id})`);
        } else {
          // Priority 2: Service-specific with any nbr_of_sessions - select the one with largest nbr_of_sessions
          const serviceSpecificFrequencies = template.service_frequencies.filter(
            f => f.service_ref_id === serviceTemplateId
          );
          if (serviceSpecificFrequencies.length > 0) {
            frequency = serviceSpecificFrequencies.sort((a, b) => b.nbr_of_sessions - a.nbr_of_sessions)[0];
            logger.info(`   ✅ Matched: Priority 2 - Service-specific + any nbr_of_sessions (frequency_id: ${frequency.id}, nbr_of_sessions: ${frequency.nbr_of_sessions})`);
          }
        }
        
        if (!frequency) {
          frequency = template.service_frequencies.find(
            f => f.service_ref_id === null && f.nbr_of_sessions === nbrOfSessions
          );
          if (frequency) {
            logger.info(`   ✅ Matched: Priority 3 - Default (null) + exact nbr_of_sessions (frequency_id: ${frequency.id})`);
          }
        }
        
        if (!frequency) {
          // Priority 4: Default (null) with any nbr_of_sessions - select the one with largest nbr_of_sessions
          const defaultFrequencies = template.service_frequencies.filter(
            f => f.service_ref_id === null
          );
          if (defaultFrequencies.length > 0) {
            frequency = defaultFrequencies.sort((a, b) => b.nbr_of_sessions - a.nbr_of_sessions)[0];
            logger.info(`   ✅ Matched: Priority 4 - Default (null) + any nbr_of_sessions (frequency_id: ${frequency.id}, nbr_of_sessions: ${frequency.nbr_of_sessions})`);
          }
        }
        
        if (!frequency && template.service_frequencies.length > 0) {
          // Fallback to first available frequency
          frequency = template.service_frequencies[0];
          logger.warn(`   ⚠️ Using fallback: First available frequency (frequency_id: ${frequency.id}, service_ref_id: ${frequency.service_ref_id}, nbr_of_sessions: ${frequency.nbr_of_sessions})`);
        }

        if (!frequency) {
          logger.error(`   ❌ No frequency found for template: ${template.form_name}`);
          continue; // Skip this template if no frequency found
        }

        // Ensure sessions is properly extracted as an array
        const sessionsArray = this.parseSessionsArray(frequency.sessions, `frequency ${frequency.id}`);

        if (sessionsArray.length === 0) {
          logger.warn(`⚠️ Frequency ${frequency.id} has empty sessions array for ${template.form_name}`);
        }

        logger.info(`   📋 Final config: ${template.form_name} → Sessions: [${sessionsArray.join(', ')}]`);

        configs.push({
          id: template.id, // Use template.id from treatment_target_session_forms_template
          template_id: template.id,
          frequency_id: frequency.id,
          treatment_target: template.treatment_target,
          form_name: template.form_name,
          purpose: template.purpose,
          sessions: sessionsArray,
          service_ref_id: frequency.service_ref_id,
          nbr_of_sessions: frequency.nbr_of_sessions,
        });
      }

      if (configs.length === 0) {
        logger.error('No matching service frequencies found for treatment target and service');
        return {
          message: 'No matching service frequencies found for treatment target and service',
          error: -1,
        };
      }

      logger.info(`Found ${configs.length} form configurations for treatment_target: ${data.treatment_target}, service_template_id: ${serviceTemplateId}, nbr_of_sessions: ${nbrOfSessions}`);
      
      // Debug: Log each config's sessions
      configs.forEach((cfg, idx) => {
        const sessionsArray = this.parseSessionsArray(cfg.sessions, `config ${idx + 1} (${cfg.form_name})`);
        logger.info(`   Config ${idx + 1}: ${cfg.form_name} → Sessions: [${sessionsArray.join(', ')}] (service_ref_id: ${cfg.service_ref_id}, nbr_of_sessions: ${cfg.nbr_of_sessions})`);
      });

      const tmpSession = [];
      const tmpForm = [];

      // Remove sessions where is_report = 1 in session_obj
      rec.session_obj = rec.session_obj.filter((session) => {
        return session.is_report !== 1;
      });

      // Sort session_obj by session_id
      rec.session_obj = rec.session_obj.sort(
        (a, b) => a.session_id - b.session_id,
      );

      //  Attendance form lookup (required for attendance reports)
      const attendanceForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('forms')
        .where('form_cde', 'SESSION SUM REPORT')
        .first();

      if (!attendanceForm) {
        logger.error('⚠️ CRITICAL: Attendance form (SESSION SUM REPORT) not found in database! Attendance reports will not be generated.');
      } else {
        logger.info(`✓ Attendance form loaded (form_id: ${attendanceForm.form_id})`);
      }

      // Existing loop for configs
      for (const config of configs) {
        // Ensure sessions is an array
        const sessions = this.parseSessionsArray(config.sessions, config.form_name);

        logger.info(`📋 Processing form: ${config.form_name}, sessions: [${sessions.join(', ')}], treatment_target: ${config.treatment_target}`);

        // Get dynamic form ID from form name
        const form = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('forms')
          .where('form_cde', config.form_name)
          .andWhere('status_yn', 1) // Only active forms
          .first();

        if (!form) {
          logger.error(`❌ Form not found or inactive for form_name: ${config.form_name}`);
          logger.error(`   Attempted query: form_cde = '${config.form_name}' AND status_yn = 1`);
          
          // Try to find if form exists but is inactive
          const inactiveForm = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('forms')
            .where('form_cde', config.form_name)
            .first();
          
          if (inactiveForm) {
            logger.error(`   Form exists but status_yn = ${inactiveForm.status_yn} (inactive)`);
          } else {
            logger.error(`   Form does not exist in database`);
          }
          
          continue;
        }

        logger.info(`✓ Form found: ${config.form_name} (form_id: ${form.form_id}, status_yn: ${form.status_yn})`);

        // Check if sessions array is empty
        if (!sessions || sessions.length === 0) {
          logger.warn(`⚠️ Skipping form ${config.form_name} - sessions array is empty`);
          continue;
        }

        logger.info(`   📊 Will distribute ${config.form_name} to sessions: [${sessions.join(', ')}] out of ${rec.session_obj.length} total sessions`);

        // Process each session number in the configuration
        for (
          let sessionNumber = 1;
          sessionNumber <= rec.session_obj.length;
          sessionNumber++
        ) {
          // Check if this session number should receive this form
          // Ensure both are numbers for comparison
          const sessionsAsNumbers = sessions.map(s => typeof s === 'string' ? parseInt(s, 10) : s);
          if (sessionsAsNumbers.includes(sessionNumber)) {
            const sessionIndex = sessionNumber - 1;
            if (rec.session_obj[sessionIndex]) {
              logger.info(`✅ Distributing form "${config.form_name}" to session ${sessionNumber} (session_id: ${rec.session_obj[sessionIndex].session_id})`);
              
              const tmpFormSession = {
                session_id: rec.session_obj[sessionIndex].session_id,
                form_array: [config.form_name],
              };

              const tmpTreatmentTargetForm = {
                req_id: rec.req_id,
                session_id: rec.session_obj[sessionIndex].session_id,
                client_id: rec.client_id,
                counselor_id: rec.counselor_id,
                treatment_target: data.treatment_target,
                form_name: config.form_name,
                form_id: form.form_id,
                config_id: config.id,
                purpose: config.purpose,
                session_number: sessionNumber,
                tenant_id: data.tenant_id || null,
              };

              tmpSession.push(tmpFormSession);
              tmpForm.push(tmpTreatmentTargetForm);
            } else {
              logger.warn(`⚠️ Session ${sessionNumber} not found in session_obj (length: ${rec.session_obj.length})`);
            }
          } else {
            // Log when session is skipped (only for first few sessions to avoid spam)
            if (sessionNumber <= 5) {
              logger.debug(`⏭️ Skipping session ${sessionNumber} for form "${config.form_name}" (not in sessions: [${sessions.join(', ')}])`);
            }
          }
        }
      }

      // ***********************
      // ADD Attendance with pattern: 4,4,4,4,3,4,4...
      // Sessions: 4, 8, 12, 16, 19, 23, 27, 31...
      // Add attendance form once per eligible session (outside config loop)
      // Note: config_id is required by database, so we use the first config's ID as a fallback
      // ***********************
      if (attendanceForm && configs.length > 0) {
        // Log SESSION SUM REPORT template matching (system form with fixed pattern)
        logger.info(`🔍 Matching frequency for template: SESSION SUM REPORT (system form)`);
        logger.info(`   Looking for: service_template_id=${serviceTemplateId}, nbr_of_sessions=${nbrOfSessions}`);
        logger.info(`   Available frequencies: 1`);
        logger.info(`   Frequency 1: service_ref_id=null, nbr_of_sessions=system, sessions=[4, 8, 12, 16, 19, 23, 27, 31...] (pattern-based)`);
        logger.info(`   ✅ Matched: System form with fixed pattern (sessions: 4, 8, 12, 16, 19, 23, 27, 31...)`);
        
        const attendanceSessionsAdded = new Set(); // Track which sessions already have attendance form
        const fallbackConfigId = configs[0].id; // Use first config's ID as fallback (required by DB schema)
        
        for (
          let sessionNumber = 1;
          sessionNumber <= rec.session_obj.length;
          sessionNumber++
        ) {
          const shouldAddAttendance = (
            (sessionNumber <= 16 && sessionNumber % 4 === 0) || 
            (sessionNumber >= 19 && (sessionNumber - 19) % 4 === 0)
          );
          
          if (shouldAddAttendance && !attendanceSessionsAdded.has(sessionNumber)) {
            const sessionIndex = sessionNumber - 1;
            if (rec.session_obj[sessionIndex]) {
              attendanceSessionsAdded.add(sessionNumber);
              
              const tmpFormSessionAttendance = {
                session_id: rec.session_obj[sessionIndex].session_id,
                form_array: ['SESSION SUM REPORT'],
              };

              const tmpAttendanceFormEntry = {
                req_id: rec.req_id,
                session_id: rec.session_obj[sessionIndex].session_id,
                client_id: rec.client_id,
                counselor_id: rec.counselor_id,
                treatment_target: data.treatment_target,
                form_name: 'SESSION SUM REPORT',
                form_id: attendanceForm.form_id,
                config_id: fallbackConfigId, // Use first config's ID (required by DB, attendance form not tied to specific config)
                purpose: 'SESSION SUM REPORT',
                session_number: sessionNumber,
                tenant_id: data.tenant_id || null,
              };

              tmpSession.push(tmpFormSessionAttendance);
              tmpForm.push(tmpAttendanceFormEntry);
              
              logger.info(`✅ Adding attendance form (SESSION SUM REPORT) to session ${sessionNumber}`);
            }
          }
        }
      } else if (attendanceForm && configs.length === 0) {
        logger.warn(`⚠️ Cannot add attendance forms: No configs found to use as fallback config_id`);
      }

      // Update session forms
      const updateResult = await this.updateSessionForms(tmpSession);
      if (updateResult.error) {
        return updateResult;
      }

      // Insert all forms
      if (tmpForm.length > 0) {
        logger.info(`📋 Inserting ${tmpForm.length} form(s) for req_id: ${data.req_id}`);
        const treatmentTargetFormResult =
          await this.createTreatmentTargetSessionForms(tmpForm);
        if (treatmentTargetFormResult.error) {
          return treatmentTargetFormResult;
        }
      }

      // Summary log
      logger.info(`📊 Form Distribution Summary for req_id: ${data.req_id}`);
      logger.info(`   - Total forms prepared: ${tmpForm.length}`);
      logger.info(`   - Total forms inserted: ${tmpForm.length}`);
      logger.info(`   - Total sessions updated: ${tmpSession.length}`);
      
      // Group by form name for summary
      const formsByFormName = {};
      tmpForm.forEach(f => {
        if (!formsByFormName[f.form_name]) {
          formsByFormName[f.form_name] = [];
        }
        formsByFormName[f.form_name].push(f.session_number);
      });
      
      Object.keys(formsByFormName).forEach(formName => {
        const sessionNumbers = formsByFormName[formName].sort((a, b) => a - b);
        logger.info(`   - ${formName}: Sessions [${sessionNumbers.join(', ')}]`);
      });

      return { 
        message: 'Treatment target session forms loaded successfully',
        summary: {
          total_forms_prepared: tmpForm.length,
          total_forms_inserted: tmpForm.length,
          total_sessions: tmpSession.length,
          forms_by_name: formsByFormName
        }
      };
    } catch (error) {
      logger.error(error);
      return {
        message: 'Error loading treatment target session forms',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Update session forms with treatment target forms
   * @param {Array} data - Array of session form data
   */
  async updateSessionForms(data) {
    try {
      for (const post of data) {
        // Get current session
        const [getSession] = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('session_id', Number(post.session_id));

        if (!getSession) {
          logger.error('Error getting session');
          return { message: 'Error getting session', error: -1 };
        }

        // Parse existing forms_array
        const currentForms = Array.isArray(getSession.forms_array)
          ? getSession.forms_array
          : JSON.parse(getSession.forms_array || '[]');

        // Add new forms
        const updatedForms = [...currentForms, ...post.form_array];

        const tmpSession = {
          forms_array: JSON.stringify(updatedForms),
        };

        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .update(tmpSession)
          .where('session_id', Number(post.session_id));
      }

      return { message: 'Sessions updated successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Create treatment target session forms
   * @param {Array} data - Array of session form data
   */
  async createTreatmentTargetSessionForms(data) {
    try {
      const TreatmentTargetSessionForms = (
        await import('./treatmentTargetSessionForms.js')
      ).default;
      const treatmentTargetSessionForms = new TreatmentTargetSessionForms();

      return await treatmentTargetSessionForms.createTreatmentTargetSessionForms(
        data,
      );
    } catch (error) {
      logger.error(error);
      return {
        message: 'Error creating treatment target session forms',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////
}
