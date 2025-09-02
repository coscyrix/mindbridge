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
          
          let counselorTotalAmount = 0;
          sessions.forEach((session) => {
            // Use full session price (including tax) for calculations
            const sessionPrice = parseFloat(session.session_price) || 0;
            counselorTotalAmount += sessionPrice;
          });

          // Calculate fee split based on the correct model:
          // 1. Counselor gets their percentage first
          // 2. System gets their percentage
          // 3. Tenant gets the remaining amount
          
          // Calculate counselor amount first
          const counselorAmount = (counselorTotalAmount * feeSplitConfig.counselor_share_percentage) / 100;
          
          // Calculate system amount
          const systemAmount = (counselorTotalAmount * systemPercentage) / 100;
          
          // Calculate remaining amount after counselor and system cuts
          const remainingAfterCounselorAndSystem = counselorTotalAmount - counselorAmount - systemAmount;
          
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
            console.log(`Counselor ${counselorId} (tenant ${counselorTenantId}): total_amount=${counselorTotalAmount}, counselor=${feeSplitConfig.counselor_share_percentage}%, system=${systemPercentage}%, counselor_amt=${counselorAmount}, system_amt=${systemAmount}, tenant_amt=${tenantAmount}`);
          } else {
            // If fee split is disabled, counselor gets everything after system cut
            const counselorAmount = remainingAfterCounselorAndSystem;
            tenantAmount = 0;
            
            console.log(`Counselor ${counselorId} (tenant ${counselorTenantId}): fee split disabled, counselor gets all remaining after system cut`);
          }
          
          totalTenant += tenantAmount;
        }
      }

      let totalAmount = 0;
      let totalTaxes = 0;
      let totalPreTaxAmount = 0;
      let totalSystemFromRecords = 0; // Keep original system amount from records for reference
      let totalCounselorFromRecords = 0; // Keep original counselor amount from records for reference
      
      rec.forEach((item) => {
        totalPrice += parseFloat(item.session_price) || 0;
        totalCounselorFromRecords += parseFloat(item.session_counselor_amt) || 0;
        totalSystemFromRecords += parseFloat(item.session_system_amt) || 0;
        
        // Calculate tax and pre-tax amounts
        const sessionPrice = parseFloat(item.session_price) || 0;
        const sessionTaxes = parseFloat(item.session_taxes) || 0;
        const preTaxAmount = sessionPrice - sessionTaxes;
        
        totalAmount += sessionPrice;
        totalTaxes += sessionTaxes;
        totalPreTaxAmount += preTaxAmount;
      });

      // Calculate average tax percentage
      const avgTaxPercentage = totalPreTaxAmount > 0 ? ((totalTaxes / totalPreTaxAmount) * 100) : 0;
      
      // Calculate correct amounts with perfect precision
      let correctSystemAmount = totalSystemFromRecords; // Default to original amount
      let correctCounselorAmount = totalCounselorFromRecords; // Default to original amount
      
      try {
        // Handle different role scenarios
        if (data.role_id === 2 && data.counselor_id && data.tenant_id) {
          // Role 2: Specific counselor with tenant
          const userMapping = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('user_profile')
            .where('user_profile_id', data.counselor_id)
            .select('user_id')
            .first();

          if (userMapping) {
            const feeSplitConfig = await this.feeSplitManagement.getFeeSplitPercentages(data.tenant_id, userMapping.user_id);
            const refFees = await db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('ref_fees')
              .where('tenant_id', data.tenant_id)
              .select('system_pcnt')
              .first();
            
            const systemPercentage = refFees?.system_pcnt || 0;
            
            correctCounselorAmount = Math.round((totalAmount * feeSplitConfig.counselor_share_percentage) / 100 * 10000) / 10000;
            correctSystemAmount = Math.round((totalAmount * systemPercentage) / 100 * 10000) / 10000;
          }
        } else if (data.role_id === 3 && data.tenant_id) {
          // Role 3: Tenant manager - use first counselor's fee split as reference
          const counselorIds = [...new Set(rec.map(item => item.counselor_id))];
          
          if (counselorIds.length > 0) {
            const firstCounselorId = counselorIds[0];
            
            const userMapping = await db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('user_profile')
              .where('user_profile_id', firstCounselorId)
              .select('user_id')
              .first();
            
            if (userMapping) {
              const feeSplitConfig = await this.feeSplitManagement.getFeeSplitPercentages(data.tenant_id, userMapping.user_id);
              const refFees = await db
                .withSchema(`${process.env.MYSQL_DATABASE}`)
                .from('ref_fees')
                .where('tenant_id', data.tenant_id)
                .select('system_pcnt')
                .first();
              
              const systemPercentage = refFees?.system_pcnt || 0;
              
              correctCounselorAmount = Math.round((totalAmount * feeSplitConfig.counselor_share_percentage) / 100 * 10000) / 10000;
              correctSystemAmount = Math.round((totalAmount * systemPercentage) / 100 * 10000) / 10000;
              
              console.log(`Role 3 calculation: total=${totalAmount}, counselor=${correctCounselorAmount}, system=${correctSystemAmount}, using counselor_id=${firstCounselorId}`);
            }
          }
        } else if (data.role_id === 4 && data.counselor_id && data.tenant_id) {
          // Role 4: System admin with specific counselor and tenant
          const userMapping = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('user_profile')
            .where('user_profile_id', data.counselor_id)
            .select('user_id')
            .first();

          if (userMapping) {
            const feeSplitConfig = await this.feeSplitManagement.getFeeSplitPercentages(data.tenant_id, userMapping.user_id);
            const refFees = await db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('ref_fees')
              .where('tenant_id', data.tenant_id)
              .select('system_pcnt')
              .first();
            
            const systemPercentage = refFees?.system_pcnt || 0;
            
            correctCounselorAmount = Math.round((totalAmount * feeSplitConfig.counselor_share_percentage) / 100 * 10000) / 10000;
            correctSystemAmount = Math.round((totalAmount * systemPercentage) / 100 * 10000) / 10000;
          }
        } else if (data.role_id === 4 && data.tenant_id && !data.counselor_id) {
          // Role 4: System admin with specific tenant but no counselor - calculate based on fee splits for all counselors in that tenant
          console.log('Role 4: Calculating amounts based on fee splits for all counselors in tenant_id=' + data.tenant_id);
          
          // Group sessions by counselor_id within the specific tenant
          const sessionGroups = {};
          rec.forEach(session => {
            if (session.tenant_id == data.tenant_id) {
              const counselorId = session.counselor_id;
              if (!sessionGroups[counselorId]) {
                sessionGroups[counselorId] = {
                  counselor_id: counselorId,
                  sessions: [],
                  totalAmount: 0
                };
              }
              sessionGroups[counselorId].sessions.push(session);
              sessionGroups[counselorId].totalAmount += parseFloat(session.session_price) || 0;
            }
          });
          
          let calculatedCounselorAmount = 0;
          let calculatedSystemAmount = 0;
          
          // Calculate amounts for each counselor in the tenant
          for (const [counselorId, group] of Object.entries(sessionGroups)) {
            try {
              const userMapping = await db
                .withSchema(`${process.env.MYSQL_DATABASE}`)
                .from('user_profile')
                .where('user_profile_id', group.counselor_id)
                .select('user_id')
                .first();
              
              if (userMapping) {
                const feeSplitConfig = await this.feeSplitManagement.getFeeSplitPercentages(data.tenant_id, userMapping.user_id);
                const refFees = await db
                  .withSchema(`${process.env.MYSQL_DATABASE}`)
                  .from('ref_fees')
                  .where('tenant_id', data.tenant_id)
                  .select('system_pcnt')
                  .first();
                
                const systemPercentage = refFees?.system_pcnt || 0;
                
                const groupCounselorAmount = Math.round((group.totalAmount * feeSplitConfig.counselor_share_percentage) / 100 * 10000) / 10000;
                const groupSystemAmount = Math.round((group.totalAmount * systemPercentage) / 100 * 10000) / 10000;
                
                calculatedCounselorAmount += groupCounselorAmount;
                calculatedSystemAmount += groupSystemAmount;
                
                console.log(`Tenant ${data.tenant_id}, Counselor ${counselorId}: total=${group.totalAmount}, counselor=${groupCounselorAmount}, system=${groupSystemAmount}, counselor_share=${feeSplitConfig.counselor_share_percentage}%, system_share=${systemPercentage}%`);
              }
            } catch (error) {
              console.error(`Error calculating for counselor ${counselorId} in tenant ${data.tenant_id}:`, error);
              // Use original amounts for this group on error
              const groupOriginalCounselor = group.sessions.reduce((sum, session) => sum + (parseFloat(session.session_counselor_amt) || 0), 0);
              const groupOriginalSystem = group.sessions.reduce((sum, session) => sum + (parseFloat(session.session_system_amt) || 0), 0);
              calculatedCounselorAmount += groupOriginalCounselor;
              calculatedSystemAmount += groupOriginalSystem;
            }
          }
          
          correctCounselorAmount = Math.round(calculatedCounselorAmount * 10000) / 10000;
          correctSystemAmount = Math.round(calculatedSystemAmount * 10000) / 10000;
          
          console.log(`Role 4 with tenant_id=${data.tenant_id} final calculation: total=${totalAmount}, counselor=${correctCounselorAmount}, system=${correctSystemAmount}`);
        } else if (data.role_id === 4 && !data.counselor_id && !data.tenant_id) {
          // Role 4: System admin viewing all data - calculate based on fee splits for each tenant/counselor
          console.log('Role 4: Calculating amounts based on fee splits for all tenants/counselors');
          
          // Group sessions by tenant_id and counselor_id to calculate amounts correctly
          const sessionGroups = {};
          rec.forEach(session => {
            const key = `${session.tenant_id}_${session.counselor_id}`;
            if (!sessionGroups[key]) {
              sessionGroups[key] = {
                tenant_id: session.tenant_id,
                counselor_id: session.counselor_id,
                sessions: [],
                totalAmount: 0
              };
            }
            sessionGroups[key].sessions.push(session);
            sessionGroups[key].totalAmount += parseFloat(session.session_price) || 0;
          });
          
          let calculatedCounselorAmount = 0;
          let calculatedSystemAmount = 0;
          
          // Calculate amounts for each tenant/counselor group
          for (const [key, group] of Object.entries(sessionGroups)) {
            try {
              const userMapping = await db
                .withSchema(`${process.env.MYSQL_DATABASE}`)
                .from('user_profile')
                .where('user_profile_id', group.counselor_id)
                .select('user_id')
                .first();
              
              if (userMapping) {
                const feeSplitConfig = await this.feeSplitManagement.getFeeSplitPercentages(group.tenant_id, userMapping.user_id);
                const refFees = await db
                  .withSchema(`${process.env.MYSQL_DATABASE}`)
                  .from('ref_fees')
                  .where('tenant_id', group.tenant_id)
                  .select('system_pcnt')
                  .first();
                
                const systemPercentage = refFees?.system_pcnt || 0;
                
                const groupCounselorAmount = Math.round((group.totalAmount * feeSplitConfig.counselor_share_percentage) / 100 * 10000) / 10000;
                const groupSystemAmount = Math.round((group.totalAmount * systemPercentage) / 100 * 10000) / 10000;
                
                calculatedCounselorAmount += groupCounselorAmount;
                calculatedSystemAmount += groupSystemAmount;
                
                console.log(`Group ${key}: total=${group.totalAmount}, counselor=${groupCounselorAmount}, system=${groupSystemAmount}, counselor_share=${feeSplitConfig.counselor_share_percentage}%, system_share=${systemPercentage}%`);
              }
            } catch (error) {
              console.error(`Error calculating for group ${key}:`, error);
              // Use original amounts for this group on error
              const groupOriginalCounselor = group.sessions.reduce((sum, session) => sum + (parseFloat(session.session_counselor_amt) || 0), 0);
              const groupOriginalSystem = group.sessions.reduce((sum, session) => sum + (parseFloat(session.session_system_amt) || 0), 0);
              calculatedCounselorAmount += groupOriginalCounselor;
              calculatedSystemAmount += groupOriginalSystem;
            }
          }
          
          correctCounselorAmount = Math.round(calculatedCounselorAmount * 10000) / 10000;
          correctSystemAmount = Math.round(calculatedSystemAmount * 10000) / 10000;
          
          console.log(`Role 4 final calculation: total=${totalAmount}, counselor=${correctCounselorAmount}, system=${correctSystemAmount}`);
        }
      } catch (error) {
        console.error('Error calculating amounts with perfect precision:', error);
        // Keep original amounts on error
        correctSystemAmount = totalSystemFromRecords;
        correctCounselorAmount = totalCounselorFromRecords;
      }
      
      const summary = {
        sum_session_price: totalPrice.toFixed(4),
        sum_session_counselor_amt: correctCounselorAmount.toFixed(4),
        sum_session_system_amt: correctSystemAmount.toFixed(4),
        sum_session_system_units: rec.length,
        sum_session_total_amount: totalAmount.toFixed(4),
        sum_session_taxes: totalTaxes.toFixed(4),
        sum_session_pre_tax_amount: totalPreTaxAmount.toFixed(4),
        sum_session_tax_percentage: avgTaxPercentage.toFixed(2),
      };

      // Add tenant_amount to summary if calculated
      if (shouldCalculateTenantAmount) {
        // Calculate tenant amount with perfect precision
        let correctTenantAmount = totalTenant; // Default to original amount
        
        if ((data.role_id === 2 || data.role_id === 3 || data.role_id === 4) && data.counselor_id && data.tenant_id) {
          // Use the tenant amount calculated in the perfect precision section above
          correctTenantAmount = Math.round((totalAmount - correctCounselorAmount - correctSystemAmount) * 10000) / 10000;
        } else if (data.role_id === 4 && data.tenant_id && !data.counselor_id) {
          // For role_id=4 with specific tenant but no counselor, calculate tenant amount as remainder
          correctTenantAmount = Math.round((totalAmount - correctCounselorAmount - correctSystemAmount) * 10000) / 10000;
        } else if (data.role_id === 4 && !data.counselor_id && !data.tenant_id) {
          // For role_id=4 viewing all data, calculate tenant amount as remainder
          correctTenantAmount = Math.round((totalAmount - correctCounselorAmount - correctSystemAmount) * 10000) / 10000;
        }
        
        summary.sum_session_tenant_amt = correctTenantAmount.toFixed(4);
        summary.sum_session_counselor_tenant_amt = correctCounselorAmount.toFixed(4);
        
        // Verify perfect precision
        const calculatedTotal = correctCounselorAmount + correctSystemAmount + correctTenantAmount;
        const difference = Math.abs(calculatedTotal - totalAmount);
        
        if (difference > 0.0001) {
          console.warn(`Final precision check failed: calculated=${calculatedTotal}, actual=${totalAmount}, diff=${difference}`);
        } else {
          console.log(`Perfect precision achieved: total=${totalAmount}, counselor=${correctCounselorAmount}, system=${correctSystemAmount}, tenant=${correctTenantAmount}, sum=${calculatedTotal}`);
        }
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
              calculation_method: "counselor_first_then_system_then_tenant_remaining_tax_inclusive",
              tax_information: {
                total_tax_amount: totalTaxes.toFixed(4),
                total_pre_tax_amount: totalPreTaxAmount.toFixed(4),
                average_tax_percentage: avgTaxPercentage.toFixed(2),
                calculation_base: "tax_inclusive",
                note: "Tax rates may vary by tenant. Individual session records contain tenant-specific tax amounts. System and counselor amounts are calculated from total amount (tax-inclusive)."
              }
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

      // Add fee split management data to each individual record in rec_list
      if (rec && Array.isArray(rec)) {
        for (const session of rec) {
          try {
            // Get fee split configuration for this specific session's counselor
            const feeSplitConfig = await this.feeSplitManagement.getFeeSplitConfigurationForCounselor(
              session.tenant_id, 
              session.counselor_id
            );
            
            if (!feeSplitConfig.error) {
              session.fee_split_management = feeSplitConfig;
            } else {
              // If there's an error, provide default fee split configuration
              session.fee_split_management = {
                is_fee_split_enabled: false,
                tenant_share_percentage: 0,
                counselor_share_percentage: 100,
                counselor_user_id: session.counselor_id,
                counselor_info: null
              };
            }
          } catch (feeSplitError) {
            console.error('Error fetching fee split management for session:', feeSplitError);
            // Provide default fee split configuration on error
            session.fee_split_management = {
              is_fee_split_enabled: false,
              tenant_share_percentage: 0,
              counselor_share_percentage: 100,
              counselor_user_id: session.counselor_id,
              counselor_info: null
            };
          }
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
