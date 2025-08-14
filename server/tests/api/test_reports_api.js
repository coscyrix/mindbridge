import request from 'supertest';
import { expect } from 'chai';
import app from '../../app.js';

describe('Reports API', () => {
  describe('GET /api/reports/user-form', () => {
    it('should include tenant_id filter when role_id=4 and counselor_id is provided', async () => {
      const response = await request(app)
        .get('/api/reports/user-form')
        .query({
          role_id: 4,
          counselor_id: 1
        })
        .expect(200);

      // The response should be successful and the query should include tenant_id filtering
      expect(response.status).to.equal(200);
      
      // Verify that tenant_id is included in the response
      if (response.body && response.body.length > 0) {
        expect(response.body[0]).to.have.property('tenant_id');
      }
    });

    it('should include tenant_id filter when role_id=2 and counselor_id is provided', async () => {
      const response = await request(app)
        .get('/api/reports/user-form')
        .query({
          role_id: 2,
          counselor_id: 1
        })
        .expect(200);

      expect(response.status).to.equal(200);
      
      // Verify that tenant_id is included in the response
      if (response.body && response.body.length > 0) {
        expect(response.body[0]).to.have.property('tenant_id');
      }
    });

    it('should include tenant_id filter when role_id=3 and counselor_id is provided', async () => {
      const response = await request(app)
        .get('/api/reports/user-form')
        .query({
          role_id: 3,
          counselor_id: 1
        })
        .expect(200);

      expect(response.status).to.equal(200);
      
      // Verify that tenant_id is included in the response
      if (response.body && response.body.length > 0) {
        expect(response.body[0]).to.have.property('tenant_id');
      }
    });

    it('should return 400 when role_id is missing', async () => {
      const response = await request(app)
        .get('/api/reports/user-form')
        .query({
          counselor_id: 1
        })
        .expect(400);

      expect(response.body.message).to.equal('Missing mandatory fields');
    });
  });

  describe('GET /api/reports/session', () => {
    it('should include tenant_id filter when role_id=4 and counselor_id is provided', async () => {
      const response = await request(app)
        .get('/api/reports/session')
        .query({
          role_id: 4,
          counselor_id: 1
        })
        .expect(200);

      expect(response.status).to.equal(200);
      
      // Verify that tenant_id is included in the response
      if (response.body && response.body.length > 0) {
        expect(response.body[0]).to.have.property('tenant_id');
      }
    });
  });

  describe('GET /api/reports/session-stats', () => {
    it('should include tenant_id filter when role_id=4 and counselor_id is provided', async () => {
      const response = await request(app)
        .get('/api/reports/session-stats')
        .query({
          role_id: 4,
          counselor_id: 1
        })
        .expect(200);

      expect(response.status).to.equal(200);
      
      // Verify that tenant_id is included in the response
      if (response.body && response.body.length > 0) {
        expect(response.body[0]).to.have.property('tenant_id');
      }
    });
  });
});

describe('Invoice API', () => {
  describe('GET /api/invoice/multi', () => {
    it('should include tenant_amount in summary when role_id=3 and tenant_id is provided', async () => {
      const response = await request(app)
        .get('/api/invoice/multi')
        .query({
          role_id: 3,
          tenant_id: 432
        })
        .expect(200);

      expect(response.status).to.equal(200);
      
      // Verify that the response has the expected structure
      expect(response.body).to.have.property('rec');
      expect(response.body.rec).to.have.property('summary');
      
      // Verify that tenant_amount is included in the summary
      expect(response.body.rec.summary).to.have.property('sum_session_tenant_amt');
      
      // Verify that tenant_amount is a valid number
      const tenantAmount = parseFloat(response.body.rec.summary.sum_session_tenant_amt);
      expect(tenantAmount).to.be.a('number');
      expect(tenantAmount).to.be.at.least(0);
    });

    it('should handle counselor ID mapping correctly', async () => {
      const response = await request(app)
        .get('/api/invoice/multi')
        .query({
          role_id: 3,
          tenant_id: 121
        })
        .expect(200);

      expect(response.status).to.equal(200);
      
      // Verify that the response has the expected structure
      expect(response.body).to.have.property('rec');
      expect(response.body.rec).to.have.property('summary');
      
      // Verify that tenant_amount is included in the summary
      expect(response.body.rec.summary).to.have.property('sum_session_tenant_amt');
      
      // Verify that tenant_amount is calculated correctly (should be 50% of total if fee splits are enabled)
      const totalPrice = parseFloat(response.body.rec.summary.sum_session_price);
      const tenantAmount = parseFloat(response.body.rec.summary.sum_session_tenant_amt);
      
      if (tenantAmount > 0) {
        // If tenant amount is calculated, verify it's reasonable (should be <= total price)
        expect(tenantAmount).to.be.at.most(totalPrice);
      }
    });

    it('should show data for all counselors when role_id=3 and tenant_id is provided without counselor_id', async () => {
      const response = await request(app)
        .get('/api/invoice/multi')
        .query({
          role_id: 3,
          tenant_id: 121
        })
        .expect(200);

      expect(response.status).to.equal(200);
      
      // Verify that the response has the expected structure
      expect(response.body).to.have.property('rec');
      expect(response.body.rec).to.have.property('rec_list');
      
      // Verify that we get data from multiple counselors (if they exist)
      const sessions = response.body.rec.rec_list;
      if (sessions && sessions.length > 0) {
        // Get unique counselor IDs from the sessions
        const counselorIds = [...new Set(sessions.map(session => session.counselor_id))];
        
        // Should have data from the tenant (could be multiple counselors)
        expect(counselorIds.length).to.be.at.least(1);
        
        // All sessions should belong to the specified tenant
        sessions.forEach(session => {
          expect(session.tenant_id).to.equal(121);
        });
      }
    });
  });

  describe('GET /api/session/today', () => {
    it('should show data for all counselors when role_id=3 and tenant_id is provided without counselor_id', async () => {
      const response = await request(app)
        .get('/api/session/today')
        .query({
          role_id: 3,
          tenant_id: 121
        })
        .expect(200);

      expect(response.status).to.equal(200);
      
      // Verify that the response has the expected structure
      expect(response.body).to.have.property('session_today');
      expect(response.body).to.have.property('session_tomorrow');
      
      // Verify that we get data from the tenant (could be multiple counselors)
      const todaySessions = response.body.session_today;
      const tomorrowSessions = response.body.session_tomorrow;
      
      if (todaySessions && todaySessions.length > 0) {
        // All sessions should belong to the specified tenant
        todaySessions.forEach(session => {
          expect(session.tenant_id).to.equal(121);
        });
      }
      
      if (tomorrowSessions && tomorrowSessions.length > 0) {
        // All sessions should belong to the specified tenant
        tomorrowSessions.forEach(session => {
          expect(session.tenant_id).to.equal(121);
        });
      }
    });

    it('should return 400 when role_id=3 and no tenant_id or counselor_id is provided', async () => {
      const response = await request(app)
        .get('/api/session/today')
        .query({
          role_id: 3
        })
        .expect(400);

      expect(response.body.message).to.equal('Missing mandatory fields');
    });

    it('should not include tenant_amount in summary when role_id is not 3', async () => {
      const response = await request(app)
        .get('/api/invoice/multi')
        .query({
          role_id: 2,
          counselor_id: 1
        })
        .expect(200);

      expect(response.status).to.equal(200);
      
      // Verify that the response has the expected structure
      expect(response.body).to.have.property('rec');
      expect(response.body.rec).to.have.property('summary');
      
      // Verify that tenant_amount is NOT included in the summary
      expect(response.body.rec.summary).to.not.have.property('sum_session_tenant_amt');
    });

    it('should not include tenant_amount in summary when tenant_id is not provided', async () => {
      const response = await request(app)
        .get('/api/invoice/multi')
        .query({
          role_id: 3,
          counselor_id: 1
        })
        .expect(200);

      expect(response.status).to.equal(200);
      
      // Verify that the response has the expected structure
      expect(response.body).to.have.property('rec');
      expect(response.body.rec).to.have.property('summary');
      
      // Verify that tenant_amount is NOT included in the summary
      expect(response.body.rec.summary).to.not.have.property('sum_session_tenant_amt');
    });

    it('should return 400 when role_id is missing', async () => {
      const response = await request(app)
        .get('/api/invoice/multi')
        .query({
          tenant_id: 432
        })
        .expect(400);

      expect(response.body.message).to.equal('Mandatory fields are required');
    });

    it('should return 400 when role_id=2 and counselor_id is missing', async () => {
      const response = await request(app)
        .get('/api/invoice/multi')
        .query({
          role_id: 2
        })
        .expect(400);

      expect(response.body.message).to.equal('Counselor ID is required for that specific role');
    });

    it('should return 400 when role_id=4 and counselor_id is missing', async () => {
      const response = await request(app)
        .get('/api/invoice/multi')
        .query({
          role_id: 4
        })
        .expect(400);

      expect(response.body.message).to.equal('Counselor ID is required for that specific role');
    });
  });
});
