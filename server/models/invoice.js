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

      // Check if we need to calculate tenant_amount 
      // For role_id=2,3: when tenant_id is present
      // For role_id=4: always calculate (either for specific counselor or all counselors)
      const shouldCalculateTenantAmount = (data.role_id === 2 || data.role_id === 3) && data.tenant_id || data.role_id === 4;
      
      // Check if we need to include system_pcnt 
      // For role_id=2,3: when tenant_id is present
      // For role_id=4: always include (will be calculated per counselor if needed)
      const shouldIncludeSystemPcnt = (data.role_id === 2 || data.role_id === 3) && data.tenant_id || data.role_id === 4;



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

          // For role_id=4, get tenant_id for each counselor if not already provided
          let counselorTenantId = data.tenant_id;
          if (data.role_id === 4 && !counselorTenantId) {
            const counselorTenant = await db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('user_profile')
              .where('user_profile_id', counselorId)
              .select('tenant_id')
              .first();
            counselorTenantId = counselorTenant?.tenant_id;
          }

          if (!counselorTenantId) {
            console.log(`No tenant_id found for counselor_id ${counselorId}`);
            continue;
          }

          // Get fee split configuration for this counselor using user_id
          const feeSplitConfig = await this.feeSplitManagement.getFeeSplitPercentages(counselorTenantId, userMapping.user_id);
          
          // Get system percentage for this tenant
          const refFees = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('ref_fees')
            .where('tenant_id', counselorTenantId)
            .select('system_pcnt')
            .first();
          
          const systemPercentage = refFees?.system_pcnt || 0;
          
          let counselorTotalPreTaxAmount = 0;
          sessions.forEach((session) => {
            // Use pre-tax amount for calculations
            const sessionPrice = parseFloat(session.session_price) || 0;
            const sessionTaxes = parseFloat(session.session_taxes) || 0;
            const preTaxAmount = sessionPrice - sessionTaxes;
            counselorTotalPreTaxAmount += preTaxAmount;
          });

          // Calculate fee split based on the correct model:
          // 1. Counselor gets their percentage first
          // 2. System gets their percentage
          // 3. Tenant gets the remaining amount
          
          // Calculate counselor amount first
          const counselorAmount = (counselorTotalPreTaxAmount * feeSplitConfig.counselor_share_percentage) / 100;
          
          // Calculate system amount
          const systemAmount = (counselorTotalPreTaxAmount * systemPercentage) / 100;
          
          // Calculate remaining amount after counselor and system cuts
          const remainingAfterCounselorAndSystem = counselorTotalPreTaxAmount - counselorAmount - systemAmount;
          
          let tenantAmount = 0;
          
          if (feeSplitConfig.is_fee_split_enabled) {
            // Tenant gets the remaining amount after counselor and system cuts
            tenantAmount = remainingAfterCounselorAndSystem;
            
            // If counselor gets 100%, tenant gets 0 (only system amount is deducted)
            if (feeSplitConfig.counselor_share_percentage === 100) {
              tenantAmount = 0;
              console.log(`Counselor gets 100%, tenant gets 0`);
            }
            
            console.log(`Fee split config: enabled=${feeSplitConfig.is_fee_split_enabled}, counselor_share=${feeSplitConfig.counselor_share_percentage}%, tenant_share=${feeSplitConfig.tenant_share_percentage}%`);
            console.log(`Counselor ${counselorId} (tenant ${counselorTenantId}): pre_tax=${counselorTotalPreTaxAmount}, counselor=${feeSplitConfig.counselor_share_percentage}%, system=${systemPercentage}%, counselor_amt=${counselorAmount}, system_amt=${systemAmount}, tenant_amt=${tenantAmount}`);
          } else {
            // If fee split is disabled, counselor gets everything after system cut
            const counselorAmount = remainingAfterSystem;
            tenantAmount = 0;
            
            console.log(`Counselor ${counselorId} (tenant ${counselorTenantId}): fee split disabled, counselor gets all remaining after system cut`);
          }
          
          totalTenant += tenantAmount;
        }
      }

      let totalPreTaxAmount = 0;
      rec.forEach((item) => {
        totalPrice += parseFloat(item.session_price) || 0;
        totalCounselor += parseFloat(item.session_counselor_amt) || 0;
        totalSystem += parseFloat(item.session_system_amt) || 0;
        
        // Calculate pre-tax amount for tenant calculations
        const sessionPrice = parseFloat(item.session_price) || 0;
        const sessionTaxes = parseFloat(item.session_taxes) || 0;
        totalPreTaxAmount += (sessionPrice - sessionTaxes);
      });

      const summary = {
        sum_session_price: totalPrice.toFixed(4),
        sum_session_counselor_amt: totalCounselor.toFixed(4),
        sum_session_system_amt: totalSystem.toFixed(4),
        sum_session_system_units: rec.length,
        sum_session_pre_tax_amount: totalPreTaxAmount.toFixed(4),
      };

      // Add tenant_amount to summary if calculated
      if (shouldCalculateTenantAmount) {
        summary.sum_session_tenant_amt = totalTenant.toFixed(4);
        
        // Also add individual counselor and tenant amounts for clarity
        // Calculate the new counselor amount based on the new fee split model
        const newCounselorAmount = totalPreTaxAmount - totalTenant - totalSystem;
        summary.sum_session_counselor_tenant_amt = newCounselorAmount.toFixed(4);
        
        console.log(`Summary calculation: total=${totalPrice}, tenant_amount=${totalTenant}`);
      }

      // Add system_pcnt to summary
      if (shouldIncludeSystemPcnt) {
        try {
          if (data.role_id === 4 && !data.tenant_id) {
            // For role_id=4 without specific tenant, get system_pcnt for all tenants in the result
            const tenantIds = [...new Set(rec.map(item => item.tenant_id))];
            const systemPcnts = [];
            
            for (const tenantId of tenantIds) {
              const refFees = await db
                .withSchema(`${process.env.MYSQL_DATABASE}`)
                .from('ref_fees')
                .where('tenant_id', tenantId)
                .select('system_pcnt')
                .first();
              
              if (refFees && refFees.system_pcnt !== null && refFees.system_pcnt !== undefined) {
                systemPcnts.push(parseFloat(refFees.system_pcnt));
              }
            }
            
            // Use average system_pcnt if multiple tenants
            if (systemPcnts.length > 0) {
              summary.system_pcnt = systemPcnts.reduce((a, b) => a + b, 0) / systemPcnts.length;
            }
          } else {
            // For specific tenant_id
            const refFees = await db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('ref_fees')
              .where('tenant_id', data.tenant_id)
              .select('system_pcnt')
              .first();

            if (refFees && refFees.system_pcnt !== null && refFees.system_pcnt !== undefined) {
              summary.system_pcnt = parseFloat(refFees.system_pcnt);
            }
          }
        } catch (error) {
          console.error('Error fetching system_pcnt from ref_fees:', error);
        }
      }

      // Add fee_split_management keys if role_id=2, role_id=3, role_id=4 and counselor_id is selected
      if ((data.role_id === 2 || data.role_id === 3 || data.role_id === 4) && data.counselor_id && data.tenant_id) {
        try {
          // Get the user_id from user_profile table using counselor_id
          const userMapping = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('user_profile')
            .where('user_profile_id', data.counselor_id)
            .select('user_id')
            .first();

          if (userMapping) {
            // Get fee split configuration for this counselor
            const feeSplitConfig = await this.feeSplitManagement.getFeeSplitPercentages(data.tenant_id, userMapping.user_id);
            
            // Get system percentage for this tenant
            const refFees = await db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('ref_fees')
              .where('tenant_id', data.tenant_id)
              .select('system_pcnt')
              .first();
            
            const systemPercentage = refFees?.system_pcnt || 0;
            
            // Add fee split management keys to summary
            summary.fee_split_management = {
              is_fee_split_enabled: feeSplitConfig.is_fee_split_enabled,
              tenant_share_percentage: feeSplitConfig.tenant_share_percentage,
              counselor_share_percentage: feeSplitConfig.counselor_share_percentage,
              system_percentage: systemPercentage,
              calculation_method: "counselor_first_then_system_then_tenant_remaining"
            };
          } else {
            // If no user mapping found, return default configuration
            summary.fee_split_management = {
              is_fee_split_enabled: false,
              tenant_share_percentage: 0,
              counselor_share_percentage: 100
            };
          }
        } catch (error) {
          console.error('Error fetching fee split configuration:', error);
          // Return default configuration on error
          summary.fee_split_management = {
            is_fee_split_enabled: false,
            tenant_share_percentage: 0,
            counselor_share_percentage: 100
          };
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
