//models/service.js

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import { capitalizeFirstLetter } from '../utils/common.js';
import dotenv from 'dotenv';

const db = knex(DBconn.dbConn.development);

export default class Service {
  //////////////////////////////////////////

  async postService(data) {
    try {
      if (data.svc_formula_typ === 'd') {
        if (!data.svc_formula || !data.nbr_of_sessions) {
          logger.error(
            'svc_formula and nbr_of_sessions are required when svc_formula_typ is "d"',
          );
          return {
            message:
              'svc_formula and nbr_of_sessions are required when svc_formula_typ is "d"',
            error: -1,
          };
        }
        if (data.svc_formula.length !== data.nbr_of_sessions - 1) {
          logger.error(
            'Service formula must be one less than the number of sessions',
          );
          return {
            message:
              'Service formula must be one less than the number of sessions',
            error: -1,
          };
        }
      } else if (data.svc_formula_typ === 's') {
        if (data.svc_formula.length !== 1 || data.svc_formula.length !== 0) {
          logger.error('Service formula must be one or zero');
          return {
            message: 'Service formula must be one or zero',
            error: -1,
          };
        }
      }

      if (data.position && data.service_id) {
        if (data.position.length !== data.service_id.length) {
          logger.error('Position and service_id must be the same length');
          return {
            message: 'Position and service_id must be the same length',
            error: -1,
          };
        }
      }

      const checkReport = await this.getServiceById({
        service_id: data.service_id,
      });

      if (!checkReport.rec || checkReport.rec.length === 0) {
        logger.error('Service not found');
        return { message: 'Service not found', error: -1 };
      }

      if (data.service_id) {
        ////////////////////////////////////////////////////////////////

        const checkDischargeReport = await this.getServiceById({
          service_id: data.service_id,
          service_code: process.env.DISCHARGE_SERVICE_CODE,
        });

        const checkDr = checkDischargeReport.rec;
        if (checkDr) {
          logger.error('The service must not be a discharge report');
          return {
            message: 'The service must not be a discharge report',
            error: -1,
          };
        }

        ////////////////////////////////////////////////////////////////

        var isReportValid = checkReport.rec.some((record) => {
          return record.is_report === 1;
        });

        if (!isReportValid) {
          logger.error('The service for the report must be a report');
          return {
            message: 'The service for the report must be a report',
            error: -1,
          };
        }

        ////////////////////////////////////////////////////////////////

        // const isAdditionalValid = checkReport.rec.some((record) => {
        //   return record.is_additional === 1;
        // });

        // if (!isAdditionalValid) {
        //   logger.error(
        //     "The service for the report must be an additional service"
        //   );
        //   return {
        //     message: "The service for the report must be an additional service",
        //     error: -1,
        //   };
        // }
      }

      const checkCde = await this.getServiceById({
        service_code: data.service_code,
      });

      if (checkCde.rec && checkCde.rec.length > 0) {
        logger.error('Code already exists');
        return { message: 'Code already exists', error: -1 };
      }

      const tmpSvc = {
        service_name: capitalizeFirstLetter(data.service_name),
        service_code: data.service_code.toUpperCase(),
        is_report: isReportValid ? 1 : 0,
        is_additional: data.is_additional || 0,
        total_invoice: data.total_invoice || 0,
        nbr_of_sessions: data.nbr_of_sessions || 0,
        svc_formula_typ: data.svc_formula_typ || 's',
        svc_formula: JSON.stringify(data.svc_formula || [7]),
        svc_report_formula: JSON.stringify({
          position: data.position,
          service_id: data.service_id,
        }),
        gst: data.gst || 0,
        tenant_id: data.tenant_id,
      };

      const postSvc = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service')
        .insert(tmpSvc);

      if (!postSvc) {
        logger.error('Error creating service');
        return { message: 'Error creating service', error: -1 };
      }

      return { message: 'Service created successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error creating service', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putServiceById(data) {
    try {
      const currentService = await this.getServiceById({
        service_id: data.service_id,
      });

      if (!currentService.rec || currentService.rec.length === 0) {
        logger.error('Service not found');
        return { message: 'Service not found', error: -1 };
      }

      if (data.svc_formula_typ) {
        if (data.svc_formula_typ === 'd') {
          if (data.svc_formula && data.nbr_of_sessions) {
            if (
              data.svc_formula.length !==
              parseInt(data.nbr_of_sessions) - 1
            ) {
              return {
                message:
                  'Service formula must be one less than the number of sessions',
                error: -1,
              };
            }
          } else {
            return {
              message:
                'svc_formula and nbr_of_sessions are required when svc_formula_typ is "d"',
              error: -1,
            };
          }
        } else if (data.svc_formula_typ === 's') {
          if (data.svc_formula && data.svc_formula.length !== 1) {
            return {
              message: 'Service formula must be one',
              error: -1,
            };
          }

          if (
            data.svc_report_formula &&
            data.svc_report_formula.position &&
            data.svc_report_formula.service_id
          ) {
            if (
              data.svc_report_formula.position.length !==
              data.svc_report_formula.service_id.length
            ) {
              return {
                message: 'Position and service_id must be the same length',
                error: -1,
              };
            }
          }
        }
      }

      const tmpSvc = {
        ...(data.service_name !== undefined && {
          service_name: capitalizeFirstLetter(data.service_name),
        }),
        ...(data.service_code !== undefined && {
          service_code: data.service_code.toUpperCase(),
        }),
        ...(data.is_report !== undefined && {
          is_report: data.is_report,
        }),
        ...(data.is_additional !== undefined && {
          is_additional: data.is_additional,
        }),
        ...(data.total_invoice !== undefined && {
          total_invoice: data.total_invoice,
        }),
        ...(data.nbr_of_sessions !== undefined && {
          nbr_of_sessions: data.nbr_of_sessions,
        }),
        ...(data.svc_formula_typ !== undefined && {
          svc_formula_typ: data.svc_formula_typ,
        }),
        ...(data.svc_formula !== undefined && {
          svc_formula: JSON.stringify(data.svc_formula),
        }),
        ...(data.position !== undefined &&
          data.service_id !== undefined && {
            svc_report_formula: JSON.stringify({
              position: data.position,
              service_id: data.service_id,
            }),
          }),
        ...(data.gst !== undefined && {
          gst: data.gst,
        }),
        ...(data.discount_pcnt !== undefined && {
          discount_pcnt: data.discount_pcnt,
        }),
      };

      const putSvc = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service')
        .where('service_id', data.service_id)
        .update(tmpSvc);

      if (!putSvc) {
        logger.error('Error updating service');
        return { message: 'Error updating service', error: -1 };
      }

      return { message: 'Service updated successfully' };
    } catch (error) {
      console.error(error);
      logger.error(error);

      return { message: 'Error updating service', error: -1 };
    }
  }

  //////////////////////////////////////////

  async delServiceById(data) {
    try {
      const tmpSvc = {
        status_yn: 2,
      };
      const delSvc = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service')
        .where('service_id', data.service_id)
        .update(tmpSvc);
      if (!delSvc) {
        logger.error('Error deleting service');
        return { message: 'Error deleting service', error: -1 };
      }

      return { message: 'Service deleted successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error deleting service', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getServiceById(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service')
        .where('status_yn', 1);

      if (data.service_id) {
        if (Array.isArray(data.service_id)) {
          query = query.whereIn('service_id', data.service_id);
        } else {
          query = query.where('service_id', data.service_id);
        }
      }

      if (data.is_report) {
        query = query.andWhere('is_report', data.is_report);
      }

      if (data.service_code) {
        query = query.andWhere('service_code', data.service_code);
      }

      if (data.tenant_id) {
        query = query.andWhere('tenant_id', data.tenant_id);
      }

      const rec = await query;

      if (!rec || rec.length === 0) {
        logger.error('Error getting service');
        return { message: 'Service not found', error: -1 };
      }

      return { message: 'Service retrieved successfully', rec };
    } catch (error) {
      logger.error(error);
      console.error(error);
      return { message: 'Error getting service', error: -1 };
    }
  }
}
