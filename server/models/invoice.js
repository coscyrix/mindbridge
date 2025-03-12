//models/invoice.js

import DBconn from '../config/db.config.js';
import knex from 'knex';

const db = knex(DBconn.dbConn.development);

export default class Invoice {
  //////////////////////////////////////////

  async postInvoice(data) {
    try {
      // Check if session already invoiced
      const checkInvoice = await this.getInvoiceOr({
        session_id: data.session_id,
      });

      if (checkInvoice.rec[0]) {
        if (checkInvoice.rec[0].session_id === data.session_id) {
          return { message: 'Session already invoiced', error: -1 };
        }
        if (checkInvoice.rec.length > 0) {
          return { message: 'Invoice already exists', error: -1 };
        }
      }

      const checkInvoiceNum = await this.getInvoiceOr({
        invoice_nbr: data.invoice_nbr,
      });

      if (checkInvoiceNum.rec[0]) {
        if (checkInvoiceNum.rec[0].invoice_nbr === data.invoice_nbr) {
          return { message: 'Invoice number already exists', error: -1 };
        }
        if (checkInvoiceNum.rec.length > 0) {
          return { message: 'Invoice number already exists', error: -1 };
        }
      }

      const tmpInvoice = {
        session_id: data.session_id,
        invoice_nbr: data.invoice_nbr,
      };

      const postInvoice = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('invoice')
        .insert(tmpInvoice);

      if (!postInvoice) {
        return { message: 'Error creating invoice', error: -1 };
      }

      return { message: 'Invoice created successfully' };
    } catch (error) {
      console.log(error);
      return { message: 'Error creating invoice', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getInvoiceById(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('invoice')
        .where('status_yn', 1);

      if (data.session_id) {
        query.andWhere('session_id', data.session_id);
      }

      if (data.invoice_nbr) {
        query.andWhere('invoice_nbr', data.invoice_nbr);
      }

      const rec = await query;

      if (!rec) {
        return { message: 'Invoice not found', error: -1 };
      }

      return { message: 'Invoice found', rec };
    } catch (error) {
      return { message: 'Error getting invoice', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putInvoiceById(data) {
    try {
      const tmpInvoice = {
        session_id: data.session_id,
        invoice_nbr: data.invoice_nbr,
      };

      const putInvoice = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('invoice')
        .where('id', data.id)
        .update(tmpInvoice);

      if (!putInvoice) {
        return { message: 'Error updating invoice', error: -1 };
      }

      return { message: 'Invoice updated successfully' };
    } catch (error) {
      return { message: 'Error updating invoice', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getInvoiceOr(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('invoice');
      if (data.session_id) {
        query.orWhere('session_id', data.session_id);
      }

      if (data.invoice_nbr) {
        query.orWhere('invoice_nbr', data.invoice_nbr);
      }

      query.andWhere('status_yn', 'y');

      const rec = await query;

      if (!rec) {
        return { message: 'Invoice not found', error: -1 };
      }

      return { message: 'Invoice found', rec };
    } catch (error) {
      return { message: 'Error getting invoice', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getInvoiceByMulti(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_invoice')
        .where('status_yn', 'y')
        .where(function () {
          this.where('session_status', 'SHOW').orWhere(
            'session_status',
            'DISCHARGED',
          );
        });

      if (data.counselor_id) {
        query.andWhere('counselor_id', data.counselor_id);
      }

      if (data.client_id) {
        query.andWhere('client_id', data.client_id);
      }

      if (data.req_id) {
        query.andWhere('req_id', data.req_id);
      }

      if (data.start_dte) {
        query.andWhere('req_dte', '>=', data.start_dte);
      }

      if (data.end_dte) {
        query.andWhere('req_dte', '<=', data.end_dte);
      }

      if (data.thrpy_status) {
        query.andWhere('thrpy_status', data.thrpy_status);
      }

      const rec = await query;

      if (!rec) {
        return { message: 'Invoice not found', error: -1 };
      }

      // Calculate summary
      let totalPrice = 0;
      let totalCounselor = 0;
      let totalSystem = 0;

      const filteredRec = rec.filter((item) => item.thrpy_status !== 'SCH');

      rec.forEach((item) => {
        totalPrice += parseFloat(item.session_price) || 0;
        totalCounselor += parseFloat(item.session_counselor_amt) || 0;
        totalSystem += parseFloat(item.session_system_amt) || 0;
      });

      const summary = {
        sum_session_price: totalPrice.toFixed(4),
        sum_session_counselor_amt: totalCounselor.toFixed(4),
        sum_session_system_amt: totalSystem.toFixed(4),
        sum_session_system_units: rec.length,
      };

      return {
        message: 'Requested invoice returned',
        rec: {
          summary,
          rec_list: rec,
        },
      };
    } catch (error) {
      return { message: 'Error getting invoice', error: -1 };
    }
  }

  //////////////////////////////////////////

  async delInvoiceBySessionId(data) {
    try {
      const delInvoice = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('invoice')
        .where('session_id', data.session_id)
        .update({ status_yn: 'n' });

      if (!delInvoice) {
        return { message: 'Error deleting invoice', error: -1 };
      }

      return { message: 'Invoice deleted successfully' };
    } catch (error) {
      console.log(error);
      return { message: 'Error deleting invoice', error: -1 };
    }
  }
}
