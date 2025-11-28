import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;
import logger from '../config/winston.js';
import Common from './common.js';
import Feedback from '../services/feedback.js';
import Form from './form.js';
import SendEmail from '../middlewares/sendEmail.js';
import UserTargetOutcome from './userTargetOutcome.js';
import {
  therapyRequestDetailsEmail,
  treatmentToolsEmail,
  dischargeEmail,
  clientWelcomeEmail,
  consentFormEmail,
  welcomeAccountDetailsEmail,
  additionalServiceEmail,
  attendanceSummaryEmail,
} from '../utils/emailTmplt.js';
import { AttendancePDF } from '../utils/pdfTmplt.js';
import PDFGenerator from '../middlewares/pdf.js';
import {
  capitalizeFirstLetter,
  convertTimeToReadableFormat,
} from '../utils/common.js';
const dotenv = require('dotenv');;

dotenv.config();
const db = knex(DBconn.dbConn.development);

export default class EmailTmplt {
  //////////////////////////////////////////

  constructor() {
    this.common = new Common();
    this.form = new Form();
    this.sendEmail = new SendEmail();
    this.feedback = new Feedback();
    this.userTargetOutcome = new UserTargetOutcome();
  }

  //////////////////////////////////////////
  // sendTreatmentToolsEmail requires a session_id as an argument.
  async sendTreatmentToolEmail(data) {
    try {
      const recSession = await this.common.getSessionById({
        session_id: data.session_id,
      });
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: recSession[0].counselor_id,
      });
      const tenantIdValue = tenantId?.[0]?.tenant_id;

      const resolveFormRecord = async (formIdentifier) => {
        if (formIdentifier === undefined || formIdentifier === null) {
          return null;
        }

        let lookup;

        if (typeof formIdentifier === 'number') {
          lookup = await this.form.getFormByFormId({
            form_id: formIdentifier,
            tenant_id: tenantIdValue,
          });
        } else if (typeof formIdentifier === 'string') {
          const numericId = Number(formIdentifier);

          if (!Number.isNaN(numericId)) {
            lookup = await this.form.getFormByFormId({
              form_id: numericId,
              tenant_id: tenantIdValue,
            });
          } else {
            lookup = await this.form.getFormByCode({
              form_cde: formIdentifier,
              tenant_id: tenantIdValue,
            });
          }
        }

        if (lookup?.error) {
          logger.error('Error resolving form record', lookup.message);
          return null;
        }

        if (Array.isArray(lookup) && lookup.length > 0) {
          return lookup[0];
        }

        return null;
      };

      if (!recSession || !Array.isArray(recSession)) {
        logger.error('Session not found');
        return { message: 'Session not found', error: -1 };
      }

      const checkSessionTreatmentToolsSentStatus =
        await this.common.checkTreatmentToolsSentStatus({
          session_id: data.session_id,
        });

      if (checkSessionTreatmentToolsSentStatus?.warn === -1) {
        return {
          message: checkSessionTreatmentToolsSentStatus?.message,
          warn: -1,
        };
      }

      if (checkSessionTreatmentToolsSentStatus?.error) {
        logger.error(checkSessionTreatmentToolsSentStatus?.message);
        return {
          message: checkSessionTreatmentToolsSentStatus?.message,
          error: -1,
        };
      }

      const recThrpy = await this.common.getThrpyReqById(
        recSession[0].thrpy_req_id,
      );

      if (!recThrpy || !Array.isArray(recThrpy)) {
        logger.error('Therapy request not found');
        return { message: 'Therapy request not found', error: -1 };
      }

      const recUser = await this.common.getUserProfileByUserProfileId(
        recThrpy[0].client_id,
      );

      if (!recUser || !Array.isArray(recUser)) {
        logger.error('User profile not found');
        return { message: 'User profile not found', error: -1 };
      }

      // Get counselor email for Reply-To functionality
      let counselorEmail = null;
      if (recThrpy[0].counselor_id) {
        try {
          const counselorProfile = await this.common.getUserProfileByUserProfileId(recThrpy[0].counselor_id);
          if (counselorProfile && counselorProfile.length > 0 && counselorProfile[0].user_id) {
            const counselorUser = await this.common.getUserById(counselorProfile[0].user_id);
            if (counselorUser && counselorUser.length > 0) {
              counselorEmail = counselorUser[0].email;
              logger.info('✅ Counselor email found for Reply-To:', counselorEmail);
            }
          }
        } catch (error) {
          logger.warn('Error fetching counselor email for Reply-To:', error);
        }
      }

      // Check if we should send automatic attendance report after every 4 sessions
      await this.checkAndSendAutomaticAttendanceReport(
        recSession[0].thrpy_req_id,
        data.session_id,
        recThrpy[0],
        recUser[0],
        tenantId
      );

      for (const session of recSession) {
        // Get form mode from environment variable
        const formMode = process.env.FORM_MODE || 'auto';
        
        // Handle forms based on form mode
        if (formMode === 'treatment_target') {
          // Treatment target mode: only send treatment target forms
          const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
          const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
          
          const treatmentTargetForms = await treatmentTargetSessionForms.getFormsToSendForSession({
            session_id: session.session_id,
            tenant_id: tenantIdValue
          });

          if (!treatmentTargetForms.error && treatmentTargetForms.rec && treatmentTargetForms.rec.length > 0) {
            for (const treatmentForm of treatmentTargetForms.rec) {
              const form_name = treatmentForm.form_name;
              const form_id = treatmentForm.form_id;
              const client_full_name =
                recUser[0].user_first_name + ' ' + recUser[0].user_last_name;
              const client_id = recUser[0].user_profile_id;
              
              // Get client's target outcome ID
              let clientTargetOutcomeId = null;
              try {
                const clientTargetOutcome = await this.userTargetOutcome.getUserTargetOutcomeLatest({
                  user_profile_id: client_id,
                });
                
                if (clientTargetOutcome && clientTargetOutcome.length > 0) {
                  clientTargetOutcomeId = clientTargetOutcome[0].target_outcome_id;
                }
              } catch (error) {
                logger.error('Error retrieving client target outcome:', error);
                // Continue without target outcome ID if there's an error
              }
              
              const toolsEmail = treatmentToolsEmail(
                recUser[0].email,
                client_full_name,
                form_name.toUpperCase(),
                form_id,
                client_id,
                data.session_id,
                clientTargetOutcomeId, // Add target outcome ID parameter
                counselorEmail, // Add counselor email for Reply-To
              );

              let attendanceEmail;
              let isAttendanceForm = false;
              
              if (form_id === 24 && form_name === 'ATTENDANCE') {
                // 24 is the form_id for attendance
                isAttendanceForm = true;
                const sessions = recThrpy[0].session_obj;
                const sortedSessions = sessions.sort(
                  (a, b) => a.session_id - b.session_id,
                );

                // Remove reports sessions
                const removeReportsSessions = sortedSessions.filter(
                  (session) => session.is_report !== 1,
                );

                // Filter sessions up to the current session
                const filteredSessions = removeReportsSessions.filter(
                  (session) => session.session_id <= data.session_id,
                );

                // Count attended and cancelled sessions
                const attendedSessions = filteredSessions.filter(
                  (session) => session.session_status === 'SHOW',
                ).length;
                const cancelledSessions = filteredSessions.filter(
                  (session) => session.session_status === 'NO-SHOW',
                ).length;

                const attendancePDFTemplt = AttendancePDF(
                  `${recThrpy[0].counselor_first_name} ${recThrpy[0].counselor_last_name}`,
                  client_full_name,
                  recUser[0].clam_num,
                  removeReportsSessions.length,
                  attendedSessions,
                  cancelledSessions,
                );

                const attendancePDF = await PDFGenerator(attendancePDFTemplt);

                attendanceEmail = attendanceSummaryEmail(
                  recUser[0].email,
                  client_full_name,
                  attendancePDF,
                );

                const postATTENDANCEFeedback =
                  await this.feedback.postATTENDANCEFeedback({
                    client_id: recUser[0].user_profile_id,
                    session_id: data.session_id,
                    total_sessions: removeReportsSessions.length,
                    total_attended_sessions: attendedSessions,
                    total_cancelled_sessions: cancelledSessions,
                    tenant_id: tenantId,
                  });

                if (postATTENDANCEFeedback.error) {
                  logger.error(postATTENDANCEFeedback.message);
                  return {
                    message: postATTENDANCEFeedback.message,
                    error: -1,
                  };
                }
              }

              const email = await this.sendEmail.sendMail(
                isAttendanceForm ? attendanceEmail : toolsEmail,
              );

              if (email.error) {
                logger.error('Error sending email');
                return {
                  message: 'Error sending email',
                  error: -1,
                };
              }
            }
          }
        } else {
          // Service mode or auto mode: handle service-based forms
          if (
            session.forms_array &&
            Array.isArray(session.forms_array) &&
            session.forms_array.length > 0
          ) {
            // Determine which forms to send based on form mode
            let formsToSend = [];
            
            if (formMode === 'auto') {
              // Auto mode: use the forms_array as determined by the system
              formsToSend = session.forms_array;
            } else if (formMode === 'service') {
              // Service mode: only send service-based forms
              // Get original service-based forms for this session
              const originalServiceForms = await this.getOriginalServiceForms(session.session_id, recThrpy[0].service_id);
              formsToSend = originalServiceForms;
            }
            
            // Send forms based on the determined form type
            for (const formId of formsToSend) {
              const formRecord = await resolveFormRecord(formId);

              if (!formRecord) {
                logger.warn(`Form not found for identifier: ${formId}`);
                continue;
              }

              const form_name = formRecord.form_cde;
              const form_id = formRecord.form_id;
              const client_full_name =
                recUser[0].user_first_name + ' ' + recUser[0].user_last_name;
              const client_id = recUser[0].user_profile_id;
              
              // Get client's target outcome ID
              let clientTargetOutcomeId = null;
              try {
                const clientTargetOutcome = await this.userTargetOutcome.getUserTargetOutcomeLatest({
                  user_profile_id: client_id,
                });
                
                if (clientTargetOutcome && clientTargetOutcome.length > 0) {
                  clientTargetOutcomeId = clientTargetOutcome[0].target_outcome_id;
                }
              } catch (error) {
                logger.error('Error retrieving client target outcome:', error);
                // Continue without target outcome ID if there's an error
              }
              
              const toolsEmail = treatmentToolsEmail(
                recUser[0].email,
                client_full_name,
                form_name.toUpperCase(),
                form_id,
                client_id,
                data.session_id,
                clientTargetOutcomeId, // Add target outcome ID parameter
                counselorEmail, // Add counselor email for Reply-To
              );

              let attendanceEmail;
              let isAttendanceForm = false;
              
              if (formId === 24 && form_name === 'ATTENDANCE') {
                // 24 is the form_id for attendance
                isAttendanceForm = true;
                const sessions = recThrpy[0].session_obj;
                const sortedSessions = sessions.sort(
                  (a, b) => a.session_id - b.session_id,
                );

                // Remove reports sessions
                const removeReportsSessions = sortedSessions.filter(
                  (session) => session.is_report !== 1,
                );

                // Filter sessions up to the current session
                const filteredSessions = removeReportsSessions.filter(
                  (session) => session.session_id <= data.session_id,
                );

                // Count attended and cancelled sessions
                const attendedSessions = filteredSessions.filter(
                  (session) => session.session_status === 'SHOW',
                ).length;
                const cancelledSessions = filteredSessions.filter(
                  (session) => session.session_status === 'NO-SHOW',
                ).length;

                const attendancePDFTemplt = AttendancePDF(
                  `${recThrpy[0].counselor_first_name} ${recThrpy[0].counselor_last_name}`,
                  client_full_name,
                  recUser[0].clam_num,
                  removeReportsSessions.length,
                  attendedSessions,
                  cancelledSessions,
                );

                const attendancePDF = await PDFGenerator(attendancePDFTemplt);

                attendanceEmail = attendanceSummaryEmail(
                  recUser[0].email,
                  client_full_name,
                  attendancePDF,
                );

                const postATTENDANCEFeedback =
                  await this.feedback.postATTENDANCEFeedback({
                    client_id: recUser[0].user_profile_id,
                    session_id: data.session_id,
                    total_sessions: removeReportsSessions.length,
                    total_attended_sessions: attendedSessions,
                    total_cancelled_sessions: cancelledSessions,
                    tenant_id: tenantId,
                  });

                if (postATTENDANCEFeedback.error) {
                  logger.error(postATTENDANCEFeedback.message);
                  return {
                    message: postATTENDANCEFeedback.message,
                    error: -1,
                  };
                }
              }

              const email = await this.sendEmail.sendMail(
                isAttendanceForm ? attendanceEmail : toolsEmail,
              );

              if (email.error) {
                logger.error('Error sending email');
                return {
                  message: 'Error sending email',
                  error: -1,
                };
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  /**
   * Get original service-based forms for a session
   * @param {number} session_id - Session ID
   * @param {number} service_id - Service ID
   */
  async getOriginalServiceForms(session_id, service_id) {
    try {
      // Get service-based forms for this service
      const recForm = await this.form.getFormForSessionById({
        service_id: service_id,
      });

      if (!recForm || recForm.length === 0) {
        return [];
      }

      // Get session to determine session position
      const session = await this.common.getSessionById({
        session_id: session_id,
      });

      if (!session || !Array.isArray(session) || session.length === 0) {
        return [];
      }

      // Find session position in therapy request
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_thrpy_req')
        .where('req_id', session[0].thrpy_req_id);

      const [rec] = await query;
      
      if (!rec || !rec.session_obj) {
        return [];
      }

      // Find session position (1-based index)
      const sessionIndex = rec.session_obj.findIndex(s => s.session_id === session_id);
      const sessionPosition = sessionIndex + 1;

      // Get forms for this session position
      const sessionForms = [];
      recForm.forEach((form) => {
        if (form.frequency_typ === 'static' && form.session_position.includes(sessionPosition)) {
          sessionForms.push(form.form_id);
        }
      });

      return sessionForms;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return [];
    }
  }

  //////////////////////////////////////////

  async sendDischargeEmail(data) {
    const recUser = await this.common.getUserProfileByUserProfileId(
      data.client_id,
    );

    const dischargeEmlTmplt = dischargeEmail(
      recUser[0].email,
      `${recUser[0].user_first_name} ${recUser[0].user_last_name}`,
    );
    const sendDischargeEmlTmpltEmail =
      this.sendEmail.sendMail(dischargeEmlTmplt);

    if (!sendDischargeEmlTmpltEmail) {
      logger.error('Error sending discharge email');
      return { message: 'Error sending discharge email', error: -1 };
    }
  }

  //////////////////////////////////////////

  async sendThrpyReqDetailsEmail(data) {
    try {
      // Fetch counselor and client profiles to get country codes
      let counselorProfile = null;
      let clientProfile = null;

      if (data.big_thrpy_req_obj?.counselor_id) {
        try {
          const counselorProfiles = await this.common.getUserProfileByUserProfileId(
            data.big_thrpy_req_obj.counselor_id,
          );
          if (counselorProfiles && counselorProfiles.length > 0) {
            counselorProfile = counselorProfiles[0];
          }
        } catch (error) {
          console.warn('Error fetching counselor profile:', error);
        }
      }

      if (data.big_thrpy_req_obj?.client_id) {
        try {
          const clientProfiles = await this.common.getUserProfileByUserProfileId(
            data.big_thrpy_req_obj.client_id,
          );
          if (clientProfiles && clientProfiles.length > 0) {
            clientProfile = clientProfiles[0];
            console.log('🔍 DEBUG: Client profile fetched:', {
              client_id: data.big_thrpy_req_obj.client_id,
              has_country_code: 'country_code' in clientProfile,
              country_code: clientProfile.country_code,
              country_code_value: clientProfile.country_code,
              profile_keys: Object.keys(clientProfile),
            });
          } else {
            console.warn('🔍 DEBUG: Client profile not found for client_id:', data.big_thrpy_req_obj.client_id);
          }
        } catch (error) {
          console.warn('Error fetching client profile:', error);
        }
      } else {
        console.warn('🔍 DEBUG: No client_id in big_thrpy_req_obj:', data.big_thrpy_req_obj);
      }

      if (data.big_thrpy_req_obj?.counselor_id) {
        console.log('🔍 DEBUG: Counselor profile fetched:', {
          counselor_id: data.big_thrpy_req_obj.counselor_id,
          has_country_code: counselorProfile ? 'country_code' in counselorProfile : false,
          country_code: counselorProfile?.country_code,
          country_code_value: counselorProfile?.country_code,
          profile_keys: counselorProfile ? Object.keys(counselorProfile) : [],
        });
      } else {
        console.warn('🔍 DEBUG: No counselor_id in big_thrpy_req_obj:', data.big_thrpy_req_obj);
      }

      // Add country codes to therapy request object
      // Resolve timezones from user profile, fallback to tenant timezone
      const tenantIdForRequest = data.big_thrpy_req_obj?.tenant_id || null;
      let resolvedCounselorTimezone = counselorProfile?.timezone ?? null;
      let resolvedClientTimezone = clientProfile?.timezone ?? null;

      try {
        if (!resolvedCounselorTimezone && tenantIdForRequest) {
          const tenant = await this.common.getTenantByTenantId(tenantIdForRequest);
          if (!tenant.error && Array.isArray(tenant) && tenant[0]?.timezone) {
            resolvedCounselorTimezone = tenant[0].timezone;
          }
        }
      } catch (e) {
        console.warn('Failed to resolve counselor timezone from tenant:', e?.message || e);
      }

      try {
        if (!resolvedClientTimezone && tenantIdForRequest) {
          const tenant = await this.common.getTenantByTenantId(tenantIdForRequest);
          if (!tenant.error && Array.isArray(tenant) && tenant[0]?.timezone) {
            resolvedClientTimezone = tenant[0].timezone;
          }
        }
      } catch (e) {
        console.warn('Failed to resolve client timezone from tenant:', e?.message || e);
      }

      const therapyRequestWithContact = {
        ...data.big_thrpy_req_obj,
        // Include timezones directly from v_user_profile
        counselor_timezone: resolvedCounselorTimezone ?? null,
        client_timezone: resolvedClientTimezone ?? null,
      };

      console.log('🔍 DEBUG: Therapy request with timezone info:', {
        counselor_timezone: therapyRequestWithContact.counselor_timezone || '(none)',
        client_timezone: therapyRequestWithContact.client_timezone || '(none)',
        tenant_fallback_used: (!counselorProfile?.timezone || !clientProfile?.timezone) ? 'yes' : 'no',
      });

      // Get counselor email for Reply-To
      let counselorEmail = null;
      if (counselorProfile && counselorProfile.user_id) {
        try {
          const counselorUser = await this.common.getUserById(counselorProfile.user_id);
          if (counselorUser && counselorUser.length > 0) {
            counselorEmail = counselorUser[0].email;
            console.log('✅ Counselor email found for Reply-To:', counselorEmail);
          }
        } catch (error) {
          console.warn('Error fetching counselor email:', error);
        }
      }

      const thrpyReqEmlTmplt = therapyRequestDetailsEmail(
        data.email,
        therapyRequestWithContact,
        counselorEmail
      );
      const sendThrpyReqEmlTmpltEmail =
        this.sendEmail.sendMail(thrpyReqEmlTmplt);

      if (!sendThrpyReqEmlTmpltEmail) {
        logger.error('Error sending therapy request email');
        return {
          message: 'Error sending therapy request email',
          error: -1,
        };
      }
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  async sendWelcomeClientEmail(data) {
    try {
      const welcomeClientEmail = welcomeAccountDetailsEmail(
        data.email,
        data.client_name,
        data.user_phone_nbr ? data.user_phone_nbr : 'N/A',
        data.target_name,
        data.counselor_name,
        data.counselor_email,
        data.counselor_phone_nbr ? data.counselor_phone_nbr : 'N/A',
      );

      const sendWelcomeEmail = this.sendEmail.sendMail(welcomeClientEmail);
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  async sendClientWelcomeWithPasswordEmail(data) {
    try {
      const emailSent = clientWelcomeEmail(data.email, data.password);
      const sendEmail = this.sendEmail.sendMail(emailSent);
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  async sendClientConsentEmail(data) {
    try {
      // Encode client name for URL parameter
      const encodedClientName = encodeURIComponent(data.client_name);
      
      const sendClientConsentForm = consentFormEmail(
        data.email,
        data.client_name,
        `${process.env.BASE_URL}${process.env.FORMS}consent?client_id=${data.client_id}&form_id=23&tenant_id=${data.tenant_id}&counselor_id=${data.counselor_id}&client_name=${encodedClientName}`,
        data.counselor_id,
        data.tenant_id,
      );

      const sendConsentForm = this.sendEmail.sendMail(sendClientConsentForm);
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  async sendAdditionalServiceEmail(data) {
    try {
      const recSession = await this.common.getSessionById({
        session_id: data.session_id,
      });

      const recClient = await this.common.getUserProfileByUserProfileId(
        recSession[0].client_id,
      );

      const convertedDate = convertTimeToReadableFormat({
        dateTimeString: `${recSession[0].intake_date}T${recSession[0].scheduled_time}`,
        timeZone: process.env.TIMEZONE,
      });

      if (convertedDate.error) {
        logger.error('Error converting date');
        return { message: 'Error converting date', error: -1 };
      }

      const sendAdditionalServiceEmail = additionalServiceEmail(
        recClient[0].email,
        `${recSession[0].client_first_name} ${recSession[0].client_last_name}`,
        recSession[0].service_name,
        convertedDate.dateString,
        convertedDate.timeString,
      );

      const sendAdditionalService = this.sendEmail.sendMail(
        sendAdditionalServiceEmail,
      );
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  /**
   * Check if attendance report should be sent after every 4 sessions and send it automatically
   * @param {number} thrpy_req_id - Therapy request ID
   * @param {number} session_id - Current session ID
   * @param {Object} thrpyReq - Therapy request object
   * @param {Object} userProfile - User profile object
   * @param {Object} tenantId - Tenant ID object
   */
  async checkAndSendAutomaticAttendanceReport(thrpy_req_id, session_id, thrpyReq, userProfile, tenantId) {
    try {
      // Get all completed sessions for this therapy request (excluding report sessions)
      const sessions = thrpyReq.session_obj || [];
      const nonReportSessions = sessions.filter(session => 
        session.is_report !== 1 && 
        (session.session_status === 'SHOW' || session.session_status === 'NO-SHOW')
      );

      // Check if we have a multiple of 4 completed sessions (4, 8, 12, 16, etc.)
      if (nonReportSessions.length > 0 && nonReportSessions.length % 4 === 0) {
        const milestone = nonReportSessions.length;
        logger.info(`Sending automatic attendance report for therapy request ${thrpy_req_id} after ${milestone} sessions`);

        // Check if we've already sent an attendance report for this milestone
        const hasSentReport = await this.feedback.checkAttendanceFeedbackExists(thrpy_req_id, milestone);
        
        if (hasSentReport) {
          logger.info(`Attendance report already sent for therapy request ${thrpy_req_id} at ${milestone} sessions`);
          return;
        }

        // Generate and send attendance report
        await this.generateAndSendAttendanceReport(
          thrpy_req_id,
          session_id,
          thrpyReq,
          userProfile,
          tenantId
        );
      }
    } catch (error) {
      logger.error('Error in checkAndSendAutomaticAttendanceReport:', error);
      // Don't fail the main function if attendance report fails
    }
  }



  /**
   * Generate and send attendance report
   * @param {number} thrpy_req_id - Therapy request ID
   * @param {number} session_id - Current session ID
   * @param {Object} thrpyReq - Therapy request object
   * @param {Object} userProfile - User profile object
   * @param {Object} tenantId - Tenant ID object
   */
  async generateAndSendAttendanceReport(thrpy_req_id, session_id, thrpyReq, userProfile, tenantId) {
    try {
      const sessions = thrpyReq.session_obj || [];
      const nonReportSessions = sessions.filter(session => session.is_report !== 1);
      
      // Count attended and cancelled sessions
      const attendedSessions = nonReportSessions.filter(
        session => session.session_status === 'SHOW'
      ).length;
      const cancelledSessions = nonReportSessions.filter(
        session => session.session_status === 'NO-SHOW'
      ).length;

      const client_full_name = `${userProfile.user_first_name} ${userProfile.user_last_name}`;
      const counselor_full_name = `${thrpyReq.counselor_first_name} ${thrpyReq.counselor_last_name}`;

      // Generate attendance PDF
      const attendancePDFTemplt = AttendancePDF(
        counselor_full_name,
        client_full_name,
        userProfile.clam_num || userProfile.user_profile_id.toString(),
        nonReportSessions.length,
        attendedSessions,
        cancelledSessions
      );

      const attendancePDF = await PDFGenerator(attendancePDFTemplt);

      // Create attendance email
      const attendanceEmail = attendanceSummaryEmail(
        userProfile.email,
        client_full_name,
        attendancePDF
      );

      // Send email
      const emailResult = await this.sendEmail.sendMail(attendanceEmail);

      if (emailResult.error) {
        logger.error('Failed to send automatic attendance report email:', emailResult.message);
        return;
      }

      // Post attendance feedback to track that report was sent
      await this.feedback.postATTENDANCEFeedback({
        client_id: userProfile.user_profile_id,
        session_id: session_id,
        total_sessions: nonReportSessions.length,
        total_attended_sessions: attendedSessions,
        total_cancelled_sessions: cancelledSessions,
        tenant_id: tenantId,
        session_count: nonReportSessions.length // Mark this as the actual session milestone
      });

      logger.info(`Automatic attendance report sent successfully for therapy request: ${thrpy_req_id}`);

    } catch (error) {
      logger.error('Error generating and sending automatic attendance report:', error);
    }
  }


}
