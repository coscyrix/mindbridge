//models/session.js

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import Common from './common.js';
import Form from './form.js';
import UserProfile from './userProfile.js';
import UserForm from './userForm.js';
import Invoice from './invoice.js';
import SendEmail from '../middlewares/sendEmail.js';
import EmailTmplt from './emailTmplt.js';
import { splitIsoDatetime } from '../utils/common.js';

const db = knex(DBconn.dbConn.development);

export default class Session {
  constructor() {
    this.common = new Common();
    this.form = new Form();
    this.sendEmail = new SendEmail();
    this.userProfile = new UserProfile();
    this.userForm = new UserForm();
    this.emailTmplt = new EmailTmplt();
    this.invoice = new Invoice();
  }
  //////////////////////////////////////////

  async postSession(data) {
    try {
      // const tmpSession = {
      //   thrpy_req_id: data.thrpy_req_id,
      //   service_id: data.service_id,
      //   session_format: data.session_format,
      //   intake_date: data.intake_date,
      //   scheduled_time: data.scheduled_time,
      //   session_code: data.session_code,
      //   session_description: data.session_description,
      //   is_additional: data.is_additional,
      //   is_report: data.is_report,
      //   tenant_id: data.tenant_id,
      //   session_price: data.session_price,
      //   session_taxes: data.session_taxes,
      //   session_counselor_amt: data.session_counselor_amt,
      //   session_system_amt: data.session_system_amt,
      // };
      // console.log('data', data);
      // console.log('tmpSession', tmpSession);      

      const postSession = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .insert(data);

      if (!postSession) {
        logger.error('Error creating session');
        return { message: 'Error creating session', error: -1 };
      }

      return { message: 'Session created successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error creating session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postAdditionalSession(data) {
    try {
      let tmpSession;
      const counselorId = await this.common.getThrpyReqById(data.thrpy_req_id);
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: counselorId[0].counselor_id,
      });
      data.tenant_id = Number(tenantId[0].tenant_id);

      // Function to split the date and time from the intake date
      const { date: req_dte, time: req_time } = splitIsoDatetime(
        data.intake_date,
      );

      // Check if the ThrpyReq is discharged
      const checkThrpyReqDischarge = await this.common.checkThrpyReqDischarge({
        req_id: data.thrpy_req_id,
      });

      if (checkThrpyReqDischarge.error) {
        logger.warn(checkThrpyReqDischarge.message);
        return { message: checkThrpyReqDischarge.message, error: -1 };
      }

      const [svc] = await this.common.getServiceById(data.service_id);

      if (!svc) {
        logger.warn('Service not found');
        return { message: 'Service not found', error: -1 };
      }

      if (svc.is_additional[0] === 0) {
        logger.warn('Service is not additional');
        return { message: 'Service is not additional', error: -1 };
      }

      // Fetch reference fees for the tenant
      const ref_fees = await this.common.getRefFeesByTenantId(data.tenant_id);
      console.log('ref_fees', ref_fees); 
      if (!ref_fees || ref_fees.error) {
        logger.error('Error getting reference fees');
        return { message: 'Error getting reference fees', error: -1 };
      }

      // Calculate session amounts
      const total_invoice = Number(svc.total_invoice);
      const tax_pcnt = Number(ref_fees[0].tax_pcnt);
      const counselor_pcnt = Number(ref_fees[0].counselor_pcnt);
      const system_pcnt = Number(ref_fees[0].system_pcnt);

      const session_price = total_invoice;
      const session_taxes = total_invoice * (tax_pcnt / 100);
      const session_system_amt = (total_invoice + session_taxes) * system_pcnt;
      const session_counselor_amt = total_invoice - session_taxes - session_system_amt;

      tmpSession = {
        thrpy_req_id: data.thrpy_req_id,
        service_id: data.service_id,
        session_format: data.session_format,
        intake_date: req_dte,
        scheduled_time: req_time,
        session_description: svc.service_code,
        is_additional: svc.is_additional && svc.is_additional === 1 ? 1 : 0,
        is_report: svc.is_report && svc.is_report === 1 ? 1 : 0,
        tenant_id: data.tenant_id,
        session_price,
        session_taxes,
        session_counselor_amt,
        session_system_amt,
      };

      const postSession = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .insert(tmpSession);

      if (!postSession) {
        logger.error('Error creating session');
        return { message: 'Error creating session', error: -1 };
      }

      // const sendAdditionalServiceEmail =
      //   this.emailTmplt.sendAdditionalServiceEmail({
      //     session_id: postSession[0],
      //   });

      return { message: 'Session created successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error creating session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putSessionById(data) {
    try {
      console.log('data', data);
      // Check if session is ongoing
      const checkSessionIfOngoing = await this.checkSessionONGOING(
        data.session_id,
      );

      if (!data.invoice_nbr) {
        if (data.role_id != 4 && data.role_id != 3) {
          if (checkSessionIfOngoing.rec.length > 0) {
            console.log('checkSessionIfOngoing', checkSessionIfOngoing);
            logger.error('Session is ongoing');
            return { message: 'Session is ongoing', error: -1 };
          }
        }
      }

      const recSession = await this.getSessionById({
        session_id: data.session_id,
      });

      // Check if the ThrpyReq is discharged
      const checkThrpyReqDischarge = await this.common.checkThrpyReqDischarge({
        req_id: recSession[0].thrpy_req_id,
      });

      if (checkThrpyReqDischarge.error) {
        logger.warn(checkThrpyReqDischarge.message);
        return { message: checkThrpyReqDischarge.message, error: -1 };
      }

      // Check if user has access to update session. Can make an update even if a session is ongoing
      if (data.role_id == 4 || data.role_id == 3) {
        const checkUserAccess = await this.common.checkUserRole({
          user_profile_id: data.user_profile_id,
          role_id: data.role_id,
        });

        if (checkUserAccess.error) {
          logger.error('Error checking user role');
          return { message: checkUserAccess.message, error: -1 };
        }
      }

      // Check if session is a discharge session
      const checkDischarge = await this.getSessionById({
        session_id: data.session_id,
        service_code: process.env.DISCHARGE_SERVICE_CODE,
      });

      if (checkDischarge && checkDischarge.length > 0) {
        // Update all sessions with the same therapy request id to No Show if status is scheduled
        const putSessions = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('thrpy_req_id', checkDischarge[0].thrpy_req_id)
          .andWhere('session_status', 1)
          .whereNot('session_description', process.env.DISCHARGE_SERVICE_CODE)
          .update({ session_status: 3 });

        if (putSessions === 0) {
          logger.warn('No sessions were updated as their status was not 1.');
        } else if (!putSessions) {
          logger.error('Error updating sessions');
          return { message: 'Error updating sessions', error: -1 };
        }

        // Update the discharge session to discharged
        const putDischargeSession = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('thrpy_req_id', checkDischarge[0].thrpy_req_id)
          .whereRaw('LOWER(session_code) LIKE LOWER(?)', [
            `%_${process.env.DISCHARGE_SERVICE_CODE}%`,
          ])
          .update({ session_status: 'DISCHARGED' });

        if (!putDischargeSession) {
          logger.error('Error updating discharge session');
          return { message: 'Error updating discharge session', error: -1 };
        }

        const tmpThrpyReq = {
          thrpy_status: 2,
        };

        const putThrpyReq = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('thrpy_req')
          .where('req_id', checkDischarge[0].thrpy_req_id)
          .update(tmpThrpyReq);

        if (!putThrpyReq) {
          logger.error('Error updating therapy request');
          return { message: 'Error updating therapy request', error: -1 };
        }

        // Send discharge email
        const checkThrpyReq = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('v_thrpy_req')
          .where('status_yn', 1)
          .andWhere('req_id', checkDischarge[0].thrpy_req_id);

        const dischargeEmlTmplt = this.emailTmplt.sendDischargeEmail({
          client_id: checkThrpyReq[0].client_id,
        });
      }

      let tmpSession;
      if (data.session_status) {
        tmpSession = {
          ...(data.session_status && { session_status: data.session_status }),
          // ...data.thrpy_req_id && {thrpy_req_id: data.thrpy_req_id},
          ...(data.service_id && { service_id: data.service_id }),
          ...(data.session_format && { session_format: data.session_format }),
          ...(data.intake_date && { intake_date: data.intake_date }),
          ...(data.scheduled_time && { scheduled_time: data.scheduled_time }),
          // ...data.session_description && {session_description: data.session_description},
          // ...data.is_additional && {is_additional: data.is_additional},
          // ...data.is_report && {is_report: data.is_report},
        };
      }

      if (data.scheduled_time || data.intake_date) {
        // Split the date and time from the intake date
        data.scheduled_time = data.scheduled_time.split(' ')[1]; // Extract time part 'HH:mm:ssZ'

        tmpSession = {
          ...(data.scheduled_time && { scheduled_time: data.scheduled_time }),
          ...(data.intake_date && { intake_date: data.intake_date }),
        };
      }

      if (data.invoice_nbr) {
        // Check if invoice number already exists
        const checkInvoice = await this.invoice.getInvoiceOr({
          invoice_nbr: data.invoice_nbr,
        });

        if (checkInvoice.error) {
          logger.error('Error getting invoice');
          return { message: 'Error getting invoice', error: -1 };
        }

        if (checkInvoice.rec.length > 0) {
          logger.warn('Invoice number already used');
          return { message: 'Invoice number already used', error: -1 };
        }

        // Check if session has already been invoiced
        const checkInvoiceSession = await this.invoice.getInvoiceOr({
          session_id: data.session_id,
        });

        if (checkInvoiceSession.error) {
          logger.error('Error getting invoice');
          return { message: 'Error getting invoice', error: -1 };
        }

        // Delete invoice if it exists to save the new one
        if (checkInvoiceSession.rec.length > 0) {
          const delInvoice = await this.invoice.delInvoiceBySessionId({
            session_id: data.session_id,
          });
        }

        if (checkInvoice.rec.length === 0) {
          const tmpInvoice = {
            session_id: data.session_id,
            invoice_nbr: data.invoice_nbr,
          };

          const postInvoice = await this.invoice.postInvoice(tmpInvoice);

          if (postInvoice.error) {
            logger.error('Error creating invoice');
            return { message: 'Error creating invoice', error: -1 };
          }
        }
      }
      if (data.session_status === 3 && data.notes) {
        const sessionNotes = this.common.postNotes({
          session_id: data.session_id,
          message: data.notes,
        });

        if (sessionNotes.error) {
          logger.error('Error adding notes');
          return { message: 'Error adding notes', error: -1 };
        }
      }

      // Update session if it is not a discharge session and has not been invoiced
      if (
        (tmpSession &&
          Object.keys(tmpSession).length > 0 &&
          recSession[0].is_additional === 1) ||
        (tmpSession &&
          Object.keys(tmpSession).length > 0 &&
          !recSession[0].session_code.includes(
            `_${process.env.DISCHARGE_SERVICE_CODE}`,
          ))
      ) {
        const putSession = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('session_id', data.session_id)
          .update(tmpSession);

        console.log('////////////////3/////////////////');

        if (data.session_status) {
          if (recSession[0].is_additional != 1) {
            if (recSession[0].is_report != 1) {
              const sendTools = await this.emailTmplt.sendTreatmentToolEmail({
                session_id: data.session_id,
              });

              if (sendTools?.warn !== -1) {
                if (sendTools?.error) {
                  logger.error(sendTools?.message);
                  console.log(
                    'Error sending treatment tools email',
                    sendTools.error,
                  );
                }

                // Update user forms (for service-based forms)
                const uptUserForm = await this.userForm.putUserFormBySessionId({
                  session_id: data.session_id,
                  is_sent: 1,
                });

                if (uptUserForm.error) {
                  console.log('error updating user form', uptUserForm.error);
                  logger.error('Error updating user form');
                  return { message: 'Error updating user form', error: -1 };
                }

                // Update forms based on environment variable
                const formMode = process.env.FORM_MODE || 'auto';
                
                if (formMode === 'auto' || formMode === 'treatment_target') {
                  // Update treatment target session forms if they exist
                  const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
                  const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
                  
                  const updateTreatmentTargetForms = await treatmentTargetSessionForms.updateTreatmentTargetSessionFormsBySessionId({
                    session_id: data.session_id,
                    is_sent: true,
                  });

                  // Don't return error for treatment target forms, just log it
                  if (updateTreatmentTargetForms.error) {
                    console.log('error updating treatment target session forms', updateTreatmentTargetForms.error);
                    logger.error('Error updating treatment target session forms');
                  }
                }
                
                // Note: Service-based forms are always updated regardless of mode
                // as they are the fallback and always available
              }
            }
          }
        }

        if (!putSession) {
          logger.error('Error updating session');
          return { message: 'Error updating session', error: -1 };
        }
      }

      return { message: 'Session updated successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);

      return { message: 'Error updating session', error: -1 };
    }
  }

  //////////////////////////////////////////

  // async SendTreatmentToolsEmail(data) {
  //   try {
  //     const recSession = await this.getSessionById({
  //       session_id: data.session_id,
  //     });
  //     if (!recSession || !Array.isArray(recSession)) {
  //       logger.error('Session not found');
  //       return { message: 'Session not found', error: -1 };
  //     }

  //     const recThrpy = await this.common.getThrpyReqById(
  //       recSession[0].thrpy_req_id,
  //     );

  //     if (!recThrpy || !Array.isArray(recThrpy)) {
  //       logger.error('Therapy request not found');
  //       return { message: 'Therapy request not found', error: -1 };
  //     }

  //     const recUser = await this.common.getUserProfileByUserProfileId(
  //       recThrpy[0].client_id,
  //     );

  //     if (!recUser || !Array.isArray(recUser)) {
  //       logger.error('User profile not found');
  //       return { message: 'User profile not found', error: -1 };
  //     }

  //     recSession.forEach(async (session) => {
  //       for (const arry of session.forms_array) {
  //         const [form] = await this.form.getFormByFormId({ form_id: arry });
  //         const form_name = form.form_cde;
  //         const client_full_name =
  //           recUser[0].user_first_name + ' ' + recUser[0].user_last_name;
  //         const toolsEmail = treatmentToolsEmail(
  //           recUser[0].email,
  //           client_full_name,
  //           form_name,
  //         );

  //         const email = this.sendEmail.sendMail(toolsEmail);

  //         if (email.error) {
  //           logger.error('Error sending email');
  //           return { message: 'Error sending email', error: -1 };
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     logger.error(error);
  //     return { message: 'Something went wrong' };
  //   }
  // }

  //////////////////////////////////////////

  async delSessionById(data) {
    try {
      const tmpSession = {
        status_yn: 2,
      };

      const delSession = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('session_id', data.session_id)
        .update(tmpSession);

      if (!delSession) {
        logger.error('Error deleting session');
        return { message: 'Error deleting session', error: -1 };
      }

      return { message: 'Session deleted successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error deleting session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getSessionById(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .where('status_yn', 1);

      if (data.session_id) {
        query = query.andWhere('session_id', data.session_id);
      }

      if (data.thrpy_req_id) {
        query = query.andWhere('thrpy_req_id', data.thrpy_req_id);
      }

      if (data.service_code) {
        query = query.andWhere('service_code', data.service_code);
      }

      if (data.session_status) {
        query = query.andWhere('session_status', data.session_status);
      }

      if (data.tenant_id) {
        query = query.andWhere('tenant_id', data.tenant_id);
      }

      const rec = await query;
      if (!rec) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getSessionByThrpyReqId(data) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .where('thrpy_req_id', data.thrpy_req_id)
        .whereNot('session_status', 1);
      if (!rec) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getSessionTodayAndTomorrow(data) {
    try {
      // Get current date in user's timezone
      const user_timezone = data.user_timezone || 'UTC'; // Default to UTC if not provided
      const currentDate = new Date();
      const tomorrowDate = new Date();
      tomorrowDate.setDate(currentDate.getDate() + 1);

      const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: user_timezone,
        }).format(date);
      };

      const formattedCurrentDate = formatDate(currentDate);
      const formattedTomorrowDate = formatDate(tomorrowDate);

      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .where('intake_date_formatted', formattedCurrentDate)
        .andWhere('thrpy_status', 'ONGOING');

      // Apply role-based filtering
      console.log('Session filtering - role_id:', data.role_id, 'tenant_id:', data.tenant_id, 'counselor_id:', data.counselor_id);
      
      console.log('data',{data});
      

      if (data.role_id == 2 && data.counselor_id) {
        query.andWhere('counselor_id', data.counselor_id);
        console.log('Filtering by counselor_id:', data.counselor_id);
      } else if (data.role_id == 3 && data.tenant_id) {
        query.andWhere('tenant_id', data.tenant_id);
        console.log('Filtering by tenant_id:', data.tenant_id);
        
        // If counselor_id is provided, also filter by specific counselor
        if (data.counselor_id) {
          query.andWhere('counselor_id', data.counselor_id);
          console.log('Also filtering by counselor_id:', data.counselor_id);
        }
      } else if (data.role_id == 4) {
        // No additional filtering needed for admin role - show all sessions
        console.log('No filtering for admin role');
      } else if (data.counselor_id) {
        // Default case: filter by counselor_id if provided
        query.andWhere('counselor_id', data.counselor_id);
        console.log('Default filtering by counselor_id:', data.counselor_id);
      } else {
        console.log('No filtering applied');
      }
      const recToday = await query;

      if (!recToday) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }

      const query2 = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .where('intake_date_formatted', formattedTomorrowDate)
        .andWhere('thrpy_status', 'ONGOING');

      // Apply role-based filtering for tomorrow's sessions
      if (data.role_id == 2 && data.counselor_id) {
        query2.andWhere('counselor_id', data.counselor_id);
      } else if (data.role_id == 3 && data.tenant_id) {
        query2.andWhere('tenant_id', data.tenant_id);
        
        // If counselor_id is provided, also filter by specific counselor
        if (data.counselor_id) {
          query2.andWhere('counselor_id', data.counselor_id);
        }
      } else if (data.role_id == 4) {
        // No additional filtering needed for admin role - show all sessions
      } else if (data.counselor_id) {
        // Default case: filter by counselor_id if provided
        query2.andWhere('counselor_id', data.counselor_id);
      }
      const recTomorrow = await query2;

      if (!recTomorrow) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }

      return { session_today: recToday, session_tomorrow: recTomorrow };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async dailyUpdateSessionStatus() {
    try {
      const currentDate = new Date().toISOString().slice(0, 10); // Only get the date part
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('intake_date', '<=', currentDate)
        .andWhere('session_status', 1)
        .andWhereNot('is_report', 1)
        .update({ session_status: 3 });

      if (typeof rec !== 'number') {
        logger.error('Error updating session.');
        return { message: 'Error updating session', error: -1 };
      }

      return { message: 'Session updated successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error updating session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async checkSessionONGOING(session_id) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('session_id', session_id)
        .whereNot('session_status', 1); // where not scheduled which is 1 (Default)

      if (!rec) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }

      if (rec.length > 0) {
        return { message: 'Session is ongoing', rec };
      }

      return { message: 'Session is not ongoing', rec: [] };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting session', error: -1 };
    }
  }
}
