import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import Common from './common.js';

const db = knex(DBconn.dbConn.development);

export default class Form {
  //////////////////////////////////////////
  constructor() {
    this.common = new Common();
  }
  //////////////////////////////////////////

  async postForm(data) {
    try {
      var tmpForm = {};
      var serviceIDs = [];
      let svcError = [];

      // Handle static frequency type
      if (data.frequency_typ === 'static' || data.frequency_typ === 1) {
        // If json_selection_typ is 'exclude', validate the services
        if (
          data.json_selection_typ === 1 ||
          data.json_selection_typ === 'exclude'
        ) {
          if (data.svc_json) {
            const checkSvc =
              await this.common.getServiceByNotReportAdditionBySvcId(
                data.svc_json,
              );
            if (!checkSvc || checkSvc.error) {
              logger.error('Services not found');
              return { message: 'Services not found', error: -1 };
            }
            serviceIDs = checkSvc.map((svc) => svc.service_id);
            const maxPosition = Math.max(...data.session_position);
            checkSvc.forEach((svc) => {
              if (svc.nbr_of_sessions < maxPosition) {
                svcError.push(svc.service_name);
                logger.error('Service does not have enough sessions');
              }
            });

            if (svcError.length > 0) {
              return {
                message: `${svcError.join(', ')} Service does not have enough sessions`,
                error: -1,
              };
            }
          }
        }

        // If json_selection_typ is 'include', validate the services
        if (
          data.json_selection_typ === 2 ||
          data.json_selection_typ === 'include'
        ) {
          if (data.svc_json) {
            const checkSvc = await this.common.getServiceNotReportAdditionById(
              data.svc_json,
            );
            if (!checkSvc || checkSvc.error) {
              logger.error('Service not found');
              return { message: 'Service not found', error: -1 };
            }
            serviceIDs = checkSvc.map((svc) => svc.service_id);
            const maxPosition = Math.max(...data.session_position);
            checkSvc.forEach((svc) => {
              if (svc.nbr_of_sessions < maxPosition) {
                svcError.push(svc.service_name);
                logger.error('Service does not have enough sessions');
              }
            });

            if (svcError.length > 0) {
              return {
                message: `${svcError.join(', ')} Service does not have enough sessions`,
                error: -1,
              };
            }
          }
        }

        // Prepare the form data for static frequency type
        tmpForm = {
          form_cde: data.form_cde.toUpperCase(),
          frequency_desc: data.frequency_desc.toLowerCase(),
          frequency_typ: data.frequency_typ,
          session_position: JSON.stringify(data.session_position),
          svc_ids: JSON.stringify(serviceIDs),
        };
      }

      // Handle dynamic frequency type
      if (data.frequency_typ === 'dynamic' || data.frequency_typ === 2) {
        // If json_selection_typ is 'exclude', validate the services
        if (
          data.json_selection_typ === 1 ||
          data.json_selection_typ === 'exclude'
        ) {
          if (data.svc_json) {
            const checkSvc =
              await this.common.getServiceByNotReportAdditionBySvcId(
                data.svc_json,
              );
            if (!checkSvc || checkSvc.error) {
              logger.error('Service not found');
              return { message: 'Service not found', error: -1 };
            }
            serviceIDs = checkSvc.map((svc) => svc.service_id);
          }
        }

        // If json_selection_typ is 'include', validate the services
        if (
          data.json_selection_typ === 2 ||
          data.json_selection_typ === 'include'
        ) {
          if (data.svc_json) {
            const checkSvc = await this.common.getServiceNotReportAdditionById(
              data.svc_json,
            );
            if (!checkSvc || checkSvc.error) {
              logger.error('Service not found');
              return { message: 'Service not found', error: -1 };
            }
            serviceIDs = checkSvc.map((svc) => svc.service_id);
          }
        }

        // Prepare the form data for dynamic frequency type
        tmpForm = {
          form_cde: data.form_cde.toUpperCase(),
          frequency_desc: data.frequency_desc.toLowerCase(),
          frequency_typ: data.frequency_typ,
          form_sequence_id: data.form_sequence_id,
          svc_ids: JSON.stringify(serviceIDs),
        };
      }

      // Insert the form data into the database
      const postForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('forms')
        .insert(tmpForm);

      if (!postForm) {
        logger.error('Error creating form');
        return { message: 'Error creating form', error: -1 };
      }

      return { message: 'Form created successfully' };
    } catch (error) {
      logger.error(error);
      console.log(error);
      return { message: 'Error creating form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putFormById(data) {
    try {
      const tmpForm = {
        form_cde: data.form_cde,
        svc_json: JSON.stringify(data.svc_json),
        session_position: JSON.stringify(data.session_position),
      };

      const putForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('forms')
        .where('form_id', data.form_id)
        .update(tmpForm);

      if (!putForm) {
        logger.error('Error updating form');
        return { message: 'Error updating form', error: -1 };
      }

      return { message: 'Form updated successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error updating form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getFormById(data) {
    try {
      let query = db.withSchema(`${process.env.MYSQL_DATABASE}`).from('forms');

      if (data.form_id) {
        query = query.andWhere('form_id', data.form_id);
      }

      const rec = await query;
      if (!rec) {
        logger.error('Error getting form');
        return { message: 'Error getting form', error: -1 };
      }
      return rec.map((form) => ({
        ...form,
        svc_json: JSON.parse(form.svc_json),
        session_position: JSON.parse(form.session_position),
      }));
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getFormByFormId(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('forms')
        .where('status_yn', 1);

      if (data.form_id) {
        query = query.andWhere('form_id', data.form_id);
      }

      const rec = await query;
      if (!rec) {
        logger.error('Error getting form');
        return { message: 'Error getting form', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getFormForSessionById(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_forms')
        .where('status_yn', 1)
        .andWhereRaw(`JSON_CONTAINS(svc_ids, ?)`, [`${data.service_id}`]);

      const rec = await query;
      if (!rec || rec.length === 0) {
        logger.error('Error getting form');
        return { message: 'Error getting form', error: -1 };
      }
      return rec;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting form', error: -1 };
    }
  }
}
