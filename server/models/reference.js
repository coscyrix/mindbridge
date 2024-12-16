import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class Reference {
  //////////////////////////////////////////
  async getAllReferences() {
    try {
      const ref_target_outcomes = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('ref_target_outcomes')
        .select('target_id', 'target_name', 'target_cde', 'target_desc');

      const ref_form_sequence = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('ref_form_sequence')
        .select('sequence_id', 'sequence_cde', 'sequence_desc', 'sequence_obj');

      const service = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service')
        .select(
          'service_id',
          'service_name',
          'service_code',
          'is_report',
          'is_additional',
          'total_invoice',
          'nbr_of_sessions',
          'svc_formula_typ',
          'svc_formula',
          'svc_report_formula',
          'gst',
        );

      const roles = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('roles')
        .select('role_id', 'role_cde');

      const user_typ = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_typ')
        .select('user_typ_id', 'user_typ_cde');

      return {
        ref_target_outcomes,
        ref_form_sequence,
        service,
        roles,
        user_typ,
      };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error fetching references', error: -1 };
    }
  }
}
