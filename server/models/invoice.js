//models/invoice.js

import DBconn from '../config/db.config.js';
import knex from 'knex';
import FeeSplitManagement from './feeSplitManagement.js';

const db = knex(DBconn.dbConn.development);

export default class Invoice {
  constructor() {
    this.feeSplitManagement = new FeeSplitManagement();
  }

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
        tenant_id: data.tenant_id,
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

      if (data.tenant_id) {
        query.andWhere('tenant_id', data.tenant_id);
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

      if (data.tenant_id) {
        query.andWhere('tenant_id', data.tenant_id);
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
      // if (!(data.role_id === 4)) {
        if (data.counselor_id) {
          query.andWhere('counselor_id', Number(data.counselor_id));
        }

        if (data.client_id) {
          query.andWhere('client_id', data.client_id);
        }

        if (data.req_id) {
          query.andWhere('req_id', data.req_id);
        }

        if (data.start_dte) {
          query.andWhere('intake_date', '>=', data.start_dte);
        }

        if (data.end_dte) {
          query.andWhere('intake_date', '<=', data.end_dte);
        }

        if (data.thrpy_status) {
          query.andWhere('thrpy_status', data.thrpy_status);
        }
      // }

      if (data.tenant_id) {
        query.andWhere('tenant_id', data.tenant_id);
      }      

      const rec = await query;

      if (!rec) {
        return { message: 'Invoice not found', error: -1 };
      }

      // Calculate summary
      let totalPrice = 0;
      let totalCounselor = 0;
      let totalSystem = 0;
      let totalTenant = 0;

      // Check if we need to calculate tenant_amount (role_id=3 and tenant_id present)
      const shouldCalculateTenantAmount = data.role_id === 3 && data.tenant_id;
      
      // Check if we need to include system_pcnt for role_id=4 with tenant selection
      const shouldIncludeSystemPcnt = data.role_id === 4 && data.tenant_id;



      if (shouldCalculateTenantAmount) {
        // Group sessions by counselor to calculate tenant_amount based on fee splits
        const sessionsByCounselor = {};
        
        rec.forEach((item) => {
          const counselorId = item.counselor_id;
          if (!sessionsByCounselor[counselorId]) {
            sessionsByCounselor[counselorId] = [];
          }
          sessionsByCounselor[counselorId].push(item);
        });

        // Calculate tenant_amount for each counselor based on their fee split
        for (const [counselorId, sessions] of Object.entries(sessionsByCounselor)) {
          // Get the user_id from user_profile table using counselor_id
          const userMapping = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('user_profile')
            .where('user_profile_id', counselorId)
            .select('user_id')
            .first();

          if (!userMapping) {
            console.log(`No user mapping found for counselor_id ${counselorId}`);
            continue;
          }

          // Get fee split configuration for this counselor using user_id
          const feeSplitConfig = await this.feeSplitManagement.getFeeSplitPercentages(data.tenant_id, userMapping.user_id);
          
          let counselorTotalAmount = 0;
          sessions.forEach((session) => {
            counselorTotalAmount += parseFloat(session.session_price) || 0;
          });

          // Calculate tenant_amount based on fee split percentage
          // Only calculate if fee split is enabled and tenant share percentage > 0
          if (feeSplitConfig.is_fee_split_enabled && feeSplitConfig.tenant_share_percentage > 0) {
            const tenantAmount = (counselorTotalAmount * feeSplitConfig.tenant_share_percentage) / 100;
            totalTenant += tenantAmount;
          }
        }
      }

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

      // Add tenant_amount to summary if calculated
      if (shouldCalculateTenantAmount) {
        summary.sum_session_tenant_amt = totalTenant.toFixed(4);
      }

      // Add system_pcnt to summary if role_id=4 and tenant is selected
      if (shouldIncludeSystemPcnt) {
        try {
          const refFees = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('ref_fees')
            .where('tenant_id', data.tenant_id)
            .select('system_pcnt')
            .first();

          if (refFees && refFees.system_pcnt !== null && refFees.system_pcnt !== undefined) {
            summary.system_pcnt = parseFloat(refFees.system_pcnt);
          }
        } catch (error) {
          console.error('Error fetching system_pcnt from ref_fees:', error);
        }
      }

      return {
        message: 'Requested invoice returned',
        rec: {
          summary,
          rec_list: rec,
        },
      };
    } catch (error) {
      console.log(error);
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
