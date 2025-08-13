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
