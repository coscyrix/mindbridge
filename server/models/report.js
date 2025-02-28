import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class Report {
  //////////////////////////////////////////
  async getUserForm(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_user_form')
        .select(
          'client_first_name',
          'client_last_name',
          'client_id',
          'counselor_id',
          'form_id',
          'form_cde',
          'thrpy_req_id',
        )
        .where('thrpy_status', 'ONGOING')
        .andWhere('is_sent', 1)
        .andWhere('form_submit', 0)
        .groupBy([
          'client_first_name',
          'client_last_name',
          'form_id',
          'form_cde',
          'client_id',
          'counselor_id',
          'thrpy_req_id',
        ]);

      if (data.counselor_id) {
        query.where('counselor_id', data.counselor_id);
      }

      if (data.client_id) {
        query.where('client_id', data.client_id);
      }

      if (data.form_id) {
        query.where('form_id', data.form_id);
      }
      if (data.session_id) {
        query.where('session_id', data.session_id);
      }
      if (data.is_sent) {
        query.where('is_sent', data.is_sent);
      }
      if (data.form_submit) {
        query.where('form_submit', data.form_submit);
      }
      if (data.start_date) {
        query.where('intake_date', '>=', data.start_date);
      }
      if (data.end_date) {
        query.where('intake_date', '<=', data.end_date);
      }

      const rec = await query;

      return rec;
    } catch (error) {
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
        .andWhere('thrpy_status', 'ONGOING');
      if (data.counselor_id) {
        query.andWhere('counselor_id', data.counselor_id);
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

      const rec = await query;

      return rec;
    } catch (error) {
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

      if (data.counselor_id) {
        query.where('counselor_id', data.counselor_id);
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

      const rec = await query;

      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting reports', error: -1 };
    }
  }
}
