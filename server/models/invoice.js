//models/invoice.js

import DBconn from '../config/db.config.js';
import knex from 'knex';

const db = knex(DBconn.dbConn.development);

export default class Invoice {
  //////////////////////////////////////////

  async postInvoice(data) {
    try {
      const checkInvoice = await this.getInvoiceOr({
        session_id: data.session_id,
        invoice_nbr: data.invoice_nbr,
      });

      if (checkInvoice.rec[0]) {
        if (checkInvoice.rec[0].session_id === data.session_id) {
          return { message: 'Session already invoiced', error: -1 };
        }
        if (checkInvoice.rec.length > 0) {
          return { message: 'Invoice already exists', error: -1 };
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

      query.andWhere('status_yn', 1);

      const rec = await query;

      if (!rec) {
        return { message: 'Invoice not found', error: -1 };
      }

      return { message: 'Invoice found', rec };
    } catch (error) {
      return { message: 'Error getting invoice', error: -1 };
    }
  }
}
