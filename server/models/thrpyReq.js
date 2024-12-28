//models/thrpyReq

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import Session from './session.js';
import Service from './service.js';
import Form from './form.js';
import dotenv from 'dotenv';
import { capitalizeFirstLetter } from '../utils/common.js';
import { splitIsoDatetime } from '../utils/common.js';

const db = knex(DBconn.dbConn.development);

export default class ThrpyReq {
  //////////////////////////////////////////
  constructor() {
    this.session = new Session();
    this.service = new Service();
    this.form = new Form();
  }
  //////////////////////////////////////////

  async postThrpyReq(data) {
    try {
      // Parse the intake date and time from the ISO string
      const req_dte = data.intake_dte.split('T')[0]; // 'YYYY-MM-DD'
      const req_time = data.intake_dte.split('T')[1]; // 'HH:mm:ss.sssZ'

      // Retrieve the service details from the database
      const servc = await this.service.getServiceById({
        service_id: data.service_id,
      });

      const svc = servc.rec[0];

      const drService = await this.service.getServiceById({
        service_code: process.env.DISCHARGE_SERVICE_CODE,
      });

      const drSvc = drService.rec[0];

      if (!svc) {
        logger.error(`Error getting service with ID: ${data.service_id}`);
        return { message: 'Error getting service', error: -1 };
      }

      if (!drSvc) {
        logger.error(
          `Error getting discharge report service with service_code: DR`,
        );
        return { message: 'Error getting discharge report service', error: -1 };
      }

      // Parse svc_report_formula if needed
      if (svc.svc_report_formula_typ === 'standard') {
        if (typeof svc.svc_report_formula === 'string') {
          try {
            svc.svc_report_formula = JSON.parse(svc.svc_report_formula);
          } catch (e) {
            logger.error('Failed to parse svc_report_formula');
            return { message: 'Unexpected report formula format', error: -1 };
          }
        }
      }

      // Prepare the therapy request object
      const tmpThrpyReq = {
        counselor_id: data.counselor_id,
        client_id: data.client_id,
        service_id: data.service_id,
        session_format_id: data.session_format_id,
        req_dte: req_dte,
        req_time: req_time,
        session_desc: svc.service_code,
      };

      // Insert the therapy request into the database
      const postThrpyReq = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('thrpy_req')
        .insert(tmpThrpyReq);

      if (!postThrpyReq) {
        logger.error('Error creating therapy request');
        return { message: 'Error creating therapy request', error: -1 };
      }

      // Process sessions based on svc_formula_typ
      if (svc.svc_formula_typ === 's') {
        // Handle standard interval formula
        let svcFormula = svc.svc_formula; // Use it directly without parsing

        if (!Array.isArray(svcFormula) || svcFormula.length !== 1) {
          logger.error('Unexpected formula format for service');
          return { message: 'Unexpected formula format', error: -2 };
        }

        // Initialize currentDate using UTC to avoid timezone issues
        let currentDate = new Date(`${req_dte}T00:00:00Z`);

        // For the first session, ensure it's not on a weekend
        while (
          currentDate.getUTCDay() === 0 || // Sunday
          currentDate.getUTCDay() === 6 // Saturday
        ) {
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        for (let i = 0; i < svc.nbr_of_sessions; i++) {
          if (i !== 0) {
            // Add the interval from svcFormula
            currentDate.setUTCDate(currentDate.getUTCDate() + svcFormula[0]);

            // Skip weekends
            while (
              currentDate.getUTCDay() === 0 || // Sunday
              currentDate.getUTCDay() === 6 // Saturday
            ) {
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
          }

          // Format the date as 'YYYY-MM-DD'
          const intakeDate = currentDate.toISOString().split('T')[0];

          // Prepare the session object
          const tmpSession = {
            thrpy_req_id: postThrpyReq[0],
            service_id: data.service_id,
            intake_date: intakeDate,
            scheduled_time: req_time,
            session_format: data.session_format_id,
            session_description: svc.service_code,
          };

          // Handle reports based on svc_report_formula
          if (
            svc.svc_report_formula &&
            Array.isArray(svc.svc_report_formula.position) &&
            svc.svc_report_formula.position.includes(i + 1)
          ) {
            const reportIndex = svc.svc_report_formula.position.indexOf(i + 1);
            const reportServiceId =
              svc.svc_report_formula.service_id[reportIndex];
            const reportName = await this.service.getServiceById({
              service_id: reportServiceId,
              is_report: 1,
            });

            if (reportName && reportName.rec && reportName.rec[0]) {
              tmpSession.session_description = `${svc.service_code} ${reportName.rec[0].service_name}`;
              tmpSession.service_id = reportServiceId;
              tmpSession.is_report =
                reportName.rec[0].is_report &&
                reportName.rec[0].is_report[0] === 1
                  ? 1
                  : 0;
              tmpSession.is_additional =
                reportName.rec[0].is_additional &&
                reportName.rec[0].is_additional[0] === 1
                  ? 1
                  : 0;
            }
          }

          // Insert the session into the database
          const postSession = await this.session.postSession(tmpSession);
          if (!postSession) {
            logger.error('Error creating session');
            return { message: 'Error creating session', error: -1 };
          }
        }

        // Add the discharge report session after the last interval
        currentDate.setUTCDate(currentDate.getUTCDate() + svcFormula[0]);

        // Skip weekends for the discharge report
        while (
          currentDate.getUTCDay() === 0 || // Sunday
          currentDate.getUTCDay() === 6 // Saturday
        ) {
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        const dischargeDate = currentDate.toISOString().split('T')[0];

        // Prepare the discharge session object
        const dischargeSession = {
          thrpy_req_id: postThrpyReq[0],
          service_id: drSvc.service_id,
          intake_date: dischargeDate,
          scheduled_time: req_time,
          session_format: data.session_format_id,
          session_description: `${svc.service_code} ${drSvc.service_name}`,
          is_report: 1,
        };

        // Insert the discharge session into the database
        const postDischargeSession =
          await this.session.postSession(dischargeSession);
        if (!postDischargeSession) {
          logger.error('Error creating discharge session');
          return { message: 'Error creating discharge session', error: -1 };
        }
      } else if (svc.svc_formula_typ === 'd') {
        // Handle days apart formula
        let svcFormula;

        // Check if svc_formula is a string before parsing
        if (typeof svc.svc_formula === 'string') {
          try {
            svcFormula = JSON.parse(svc.svc_formula);
          } catch (e) {
            logger.error('Failed to parse svc_formula');
            return { message: 'Unexpected formula format', error: -1 };
          }
        } else if (Array.isArray(svc.svc_formula)) {
          svcFormula = svc.svc_formula; // Already an array
        } else {
          logger.error('svc_formula is neither a string nor an array');
          return { message: 'Unexpected formula format', error: -1 };
        }

        // Validate the formula length
        if (parseInt(svc.nbr_of_sessions) - 1 !== svcFormula.length) {
          logger.error('Unexpected formula format for service');
          return { message: 'Unexpected formula format', error: -2 };
        }

        // Initialize currentDate using UTC to avoid timezone issues
        let currentDate = new Date(`${req_dte}T00:00:00Z`);

        for (let i = 0; i < svc.nbr_of_sessions; i++) {
          if (i !== 0) {
            let daysToAdd = svcFormula[i - 1];

            // If daysToAdd is zero, schedule the session on the same day
            if (daysToAdd !== 0) {
              currentDate.setUTCDate(currentDate.getUTCDate() + daysToAdd);

              // Skip weekends
              while (
                currentDate.getUTCDay() === 0 || // Sunday
                currentDate.getUTCDay() === 6 // Saturday
              ) {
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
              }
            }
            // If daysToAdd is zero, do not change currentDate
          } else {
            // For the first session, ensure it's not on a weekend
            while (
              currentDate.getUTCDay() === 0 || // Sunday
              currentDate.getUTCDay() === 6 // Saturday
            ) {
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
          }

          // Format the date as 'YYYY-MM-DD'
          const intakeDate = currentDate.toISOString().split('T')[0];

          // Prepare the session object
          const tmpSession = {
            thrpy_req_id: postThrpyReq[0],
            service_id: data.service_id,
            intake_date: intakeDate,
            scheduled_time: req_time,
            session_format: data.session_format_id,
            session_description: svc.service_code,
          };

          // Handle reports based on svc_report_formula
          if (
            svc.svc_report_formula &&
            Array.isArray(svc.svc_report_formula.position) &&
            svc.svc_report_formula.position.includes(i + 1)
          ) {
            const reportIndex = svc.svc_report_formula.position.indexOf(i + 1);
            const reportServiceId =
              svc.svc_report_formula.service_id[reportIndex];
            const reportName = await this.service.getServiceById({
              service_id: reportServiceId,
              is_report: 1,
            });

            if (reportName && reportName.rec && reportName.rec[0]) {
              tmpSession.session_description = `${svc.service_code} ${reportName.rec[0].service_name}`;
              tmpSession.service_id = reportServiceId;
              tmpSession.is_report =
                reportName.rec[0].is_report[0] === 1 ? 1 : 0;
              tmpSession.is_additional =
                reportName.rec[0].is_additional[0] === 1 ? 1 : 0;
            }
          }

          // Insert the session into the database
          const postSession = await this.session.postSession(tmpSession);
          if (!postSession) {
            logger.error('Error creating session');
            return { message: 'Error creating session', error: -1 };
          }
        }

        // Add the discharge report session a week after the last session
        currentDate.setUTCDate(currentDate.getUTCDate() + 7);

        // Skip weekends for the discharge report
        while (
          currentDate.getUTCDay() === 0 || // Sunday
          currentDate.getUTCDay() === 6 // Saturday
        ) {
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        const dischargeDate = currentDate.toISOString().split('T')[0];

        // Prepare the discharge session object
        const dischargeSession = {
          thrpy_req_id: postThrpyReq[0],
          service_id: drSvc.service_id,
          intake_date: dischargeDate,
          scheduled_time: req_time,
          session_format: data.session_format_id,
          session_description: `${svc.service_code} ${drSvc.service_name}`,
          is_report: 1, // Use if appropriate
        };

        // Insert the discharge session into the database
        const postDischargeSession =
          await this.session.postSession(dischargeSession);
        if (!postDischargeSession) {
          logger.error('Error creating discharge session');
          return { message: 'Error creating discharge session', error: -1 };
        }
      } else {
        // Handle unexpected svc_formula_typ values
        logger.error(`Unsupported svc_formula_typ: ${svc.svc_formula_typ}`);
        return { message: 'Unsupported formula type', error: -1 };
      }

      const loadForms = await this.loadSessionForms(postThrpyReq[0]);

      if (!loadForms) {
        logger.error('Error loading session forms');
        return { message: 'Error loading session forms', error: -1 };
      }

      const ThrpyReq = await this.getThrpyReqById({
        thrpy_id: postThrpyReq[0],
      });

      if (!ThrpyReq) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      // Return a success message
      return {
        message: 'Therapy request, sessions, and reports created successfully',
        rec: ThrpyReq,
      };
    } catch (error) {
      logger.error(error);

      return {
        message: 'Error creating therapy request, sessions, and reports',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////

  async putThrpyReqById(data) {
    try {
      const checkThrpyReq = await this.getThrpyReqById({
        req_id: data.req_id,
      });

      if (checkThrpyReq.error) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      if (!checkThrpyReq || checkThrpyReq.length === 0) {
        logger.warn('Therapy request not found');
        return { message: 'Therapy request not found', error: -1 };
      }

      if (data.intake_dte) {
        // Parse the intake date and time from the ISO string
        var req_dte = data.intake_dte.split('T')[0]; // 'YYYY-MM-DD'
        var req_time = data.intake_dte.split('T')[1]; // 'HH:mm:ss.sssZ'
      }

      const tmpThrpyReq = {
        ...(data.counselor_id && { counselor_id: data.counselor_id }),
        ...(data.client_id && { client_id: data.client_id }),
        ...(data.service_id && { service_id: data.service_id }),
        ...(data.session_format_id && {
          session_format_id: data.session_format_id,
        }),
        ...(req_dte && { req_dte: req_dte }),
        ...(req_time && { req_time: req_time }),
        ...(data.session_desc && { session_desc: data.session_desc }),
        ...(data.status_yn && { status_yn: data.status_yn }),
        ...(data.thrpy_status && { thrpy_status: data.thrpy_status }),
      };

      // Logic for deleting a therapy request with sessions
      if (data.status_yn) {
        const thrpySessions = await this.session.getSessionByThrpyReqId({
          thrpy_req_id: data.req_id,
        });

        if (thrpySessions.error) {
          logger.error('Error getting therapy sessions');
          return { message: 'Error getting therapy sessions', error: -1 };
        }

        if (thrpySessions && thrpySessions.length > 0) {
          logger.warn(
            'Cannot delete therapy request with sessions that were updated',
          );
          return {
            message:
              'Cannot delete therapy request with sessions that were updated',
            error: -1,
          };
        }

        if (thrpySessions) {
          const updatedSessions = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('session')
            .where('thrpy_req_id', data.req_id)
            .update('status_yn', 2);

          if (!updatedSessions) {
            logger.error('Error deleting therapy sessions');
            return { message: 'Error deleting therapy sessions', error: -1 };
          }
        }
      }

      // Logic for discharging a therapy request
      if (data.thrpy_status) {
        const putSessions = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('thrpy_req_id', data.req_id)
          .andWhere('session_status', 1)
          .update({ session_status: 3 });

        if (!putSessions) {
          logger.error('Error updating sessions');
          return { message: 'Error updating sessions', error: -1 };
        }
      }

      const putThrpyReq = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('thrpy_req')
        .where('req_id', data.req_id)
        .update(tmpThrpyReq);

      if (!putThrpyReq) {
        logger.error('Error updating therapy request');
        return { message: 'Error updating therapy request', error: -1 };
      }
      return { message: 'Therapy request updated successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error updating therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  async delThrpyReqById(data) {
    try {
      const checkThrpyReq = await this.getThrpyReqById({
        thrpy_id: data.thrpy_id,
      });

      if (checkThrpyReq.error) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      if (!checkThrpyReq || checkThrpyReq.length === 0) {
        logger.warn('Therapy request not found');
        return { message: 'Therapy request not found', error: -1 };
      }

      const thrpySessions = await this.session.getSessionByThrpyReqId({
        thrpy_req_id: data.thrpy_id,
      });

      if (thrpySessions.error) {
        logger.error('Error getting therapy sessions');
        return { message: 'Error getting therapy sessions', error: -1 };
      }

      if (thrpySessions && thrpySessions.length > 0) {
        logger.warn(
          'Cannot delete therapy request with sessions that were updated',
        );
        return {
          message:
            'Cannot delete therapy request with sessions that were updated',
          error: -1,
        };
      }

      const delThrpyReq = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('thrpy_req')
        .where('req_id', data.thrpy_id)
        .update('status_yn', 2);
      if (!delThrpyReq) {
        logger.error('Error deleting therapy request');
        return { message: 'Error deleting therapy request', error: -1 };
      }

      if (thrpySessions) {
        const updatedSessions = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('thrpy_req_id', data.thrpy_id)
          .update('status_yn', 2);

        if (!updatedSessions) {
          logger.error('Error deleting therapy sessions');
          return { message: 'Error deleting therapy sessions', error: -1 };
        }
      }

      return { message: 'Therapy request deleted successfully' };
    } catch (error) {
      console.error(error);
      logger.error(error);

      return { message: 'Error deleting therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putThrpyDischarge(data) {
    try {
      const putSessions = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('thrpy_req_id', data.req_id)
        .andWhere('session_status', 1)
        .update({ session_status: 3 });

      if (!putSessions) {
        logger.error('Error updating sessions');
        return { message: 'Error updating sessions', error: -1 };
      }

      const tmpThrpyReq = {
        thrpy_status: data.thrpy_status,
      };

      const putThrpyReq = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('thrpy_req')
        .where('req_id', data.req_id)
        .update(tmpThrpyReq);

      if (!putThrpyReq) {
        logger.error('Error discharging therapy request');
        return { message: 'Error discharging therapy request', error: -1 };
      }
      return { message: 'Therapy request updated successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error updating therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getThrpyReqById(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_thrpy_req')
        .where('status_yn', 1);

      if (data.req_id) {
        query.andWhere('req_id', data.req_id);
      }

      const rec = await query;

      if (!rec) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      return rec;
    } catch (error) {
      logger.error(error);

      return { message: 'Error getting therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  async loadSessionForms(req_id) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_thrpy_req')
        .where('req_id', req_id);

      const [rec] = await query;

      if (!rec) {
        logger.error('Error getting session forms');
        return { message: 'Error getting session forms', error: -1 };
      }

      const recForm = await this.form.getFormForSessionById({
        service_id: rec.service_id,
      });

      if (!recForm || recForm.length === 0) {
        logger.error('Error getting session forms');
        return { message: 'Error getting session forms', error: -1 };
      }

      const tmpSession = [];

      recForm.forEach((form) => {
        // Static forms placeholder logic
        if (form.frequency_typ === 'static') {
          for (let i = 1; i <= rec.session_obj.length; i++) {
            if (form.session_position.includes(i)) {
              const tmpFormSession = {
                session_id: rec.session_obj[i - 1].session_id,
                form_array: [form.form_id],
              };

              tmpSession.push(tmpFormSession);
            }
          }
        }

        // Dynamic forms placeholder logic
        if (form.frequency_typ === 'dynamic') {
          // Sequence logic
          if (form.sequence_obj.length === 2) {
            const sequence = form.sequence_obj[0];
            if (Number.isInteger(sequence) && sequence > 0) {
              for (
                let i = sequence - 1;
                i < rec.session_obj.length;
                i += sequence
              ) {
                if (rec.session_obj[i] && rec.session_obj[i].session_id) {
                  const tmpFormSession = {
                    session_id: rec.session_obj[i].session_id,
                    form_array: [form.form_id],
                  };
                  tmpSession.push(tmpFormSession);
                }
              }
            }
          }

          // Position logic
          if (form.sequence_obj.length === 1) {
            const position = form.sequence_obj[0];
            if (typeof position === 'string') {
              //All logic
              if (position === '...') {
                for (let i = 0; i < rec.session_obj.length; i++) {
                  const tmpFormSession = {
                    session_id: rec.session_obj[i].session_id,
                    form_array: [form.form_id],
                  };
                  tmpSession.push(tmpFormSession);
                }
              }

              //First logic
              if (position === '1') {
                const tmpFormSession = {
                  session_id: rec.session_obj[0].session_id,
                  form_array: [form.form_id],
                };
                tmpSession.push(tmpFormSession);
              }

              //Last logic
              if (position === '-1') {
                const tmpFormSession = {
                  session_id:
                    rec.session_obj[rec.session_obj.length - 1].session_id,
                  form_array: [form.form_id],
                };
                tmpSession.push(tmpFormSession);
              }

              //Second to last logic
              if (position === '-2') {
                const tmpFormSession = {
                  session_id:
                    rec.session_obj[rec.session_obj.length - 2].session_id,
                  form_array: [form.form_id],
                };
                tmpSession.push(tmpFormSession);
              }
            }
          }
        }
      });

      const updteFormSession = await this.updateSessionForms(tmpSession);

      if (!updteFormSession) {
        logger.error('Error updating session forms');
        return { message: 'Error updating session forms', error: -1 };
      }

      return { message: 'Session forms loaded successfully' };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  async updateSessionForms(data) {
    try {
      for (const post of data) {
        // Fetch current forms_array
        const [getSession] = await this.session.getSessionById({
          session_id: Number(post.session_id),
        });

        if (!getSession) {
          logger.error('Error getting session');
          return { message: 'Error getting session', error: -1 };
        }

        // Parse existing forms_array
        const currentForms = Array.isArray(getSession.forms_array)
          ? getSession.forms_array
          : JSON.parse(getSession.forms_array || '[]');

        // Add new forms and remove duplicates
        const updatedForms = Array.from(
          new Set([...currentForms, ...post.form_array]),
        );

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
      console.error(error);
      logger.error(error);
      return { message: 'Error updating session forms', error: -1 };
    }
  }
}
