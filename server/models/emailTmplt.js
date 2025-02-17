import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import Common from './common.js';
import Form from './form.js';
import SendEmail from '../middlewares/sendEmail.js';
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

const db = knex(DBconn.dbConn.development);

export default class EmailTmplt {
  //////////////////////////////////////////

  constructor() {
    this.common = new Common();
    this.form = new Form();
    this.sendEmail = new SendEmail();
  }

  //////////////////////////////////////////
  // sendTreatmentToolsEmail requires a session_id as an argument.
  async sendTreatmentToolEmail(data) {
    try {
      const recSession = await this.common.getSessionById({
        session_id: data.session_id,
      });
      if (!recSession || !Array.isArray(recSession)) {
        logger.error('Session not found');
        return { message: 'Session not found', error: -1 };
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

      for (const session of recSession) {
        for (const arry of session.forms_array) {
          const [form] = await this.form.getFormByFormId({ form_id: arry });
          const form_name = form.form_cde;
          const form_id = form.form_id;
          const client_full_name =
            recUser[0].user_first_name + ' ' + recUser[0].user_last_name;
          const client_id = recUser[0].user_profile_id;
          const toolsEmail = treatmentToolsEmail(
            recUser[0].email,
            client_full_name,
            form_name.toUpperCase(),
            form_id,
            client_id,
            data.session_id,
          );

          if (arry !== 24) {
            const email = await this.sendEmail.sendMail(toolsEmail);
            if (email.error) {
              logger.error('Error sending email');
              return { message: 'Error sending email', error: -1 };
            }
          } else {
            const sessions = recThrpy[0].session_obj;
            const sortedSessions = sessions.sort(
              (a, b) => a.session_id - b.session_id,
            );
            const filteredSessions = sortedSessions.filter(
              (session) => session.session_id <= data.session_id,
            );

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
              filteredSessions.length,
              attendedSessions,
              cancelledSessions,
            );

            const attendancePDF = await PDFGenerator(attendancePDFTemplt);

            console.log('attendancePDF', attendancePDF);

            const attendanceEmail = attendanceSummaryEmail(
              recUser[0].email,
              client_full_name,
              attendancePDF,
            );

            console.log('attendanceEmail', attendanceEmail);

            const email = await this.sendEmail.sendMail(attendanceEmail);
            if (email.error) {
              logger.error('Error sending email');
              return { message: 'Error sending email', error: -1 };
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
      const thrpyReqEmlTmplt = therapyRequestDetailsEmail(
        data.email,
        data.big_thrpy_req_obj,
      );
      const sendThrpyReqEmlTmpltEmail =
        this.sendEmail.sendMail(thrpyReqEmlTmplt);

      if (!sendThrpyReqEmlTmpltEmail) {
        logger.error('Error sending therapy request email');
        return { message: 'Error sending therapy request email', error: -1 };
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
      const sendClientConsentForm = consentFormEmail(
        data.email,
        data.client_name,
        `${process.env.BASE_URL}${process.env.FORMS}consent?client_id=${data.client_id}`,
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
}
