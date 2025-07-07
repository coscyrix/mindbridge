import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import dotenv from 'dotenv';
dotenv.config();

const db = knex(DBconn.dbConn.development);

export default class Onboarding {
  async createOnboardingRequest(data) {
    try {
      const insertData = {
        organization: data.organization,
        contact: data.contact,
        position: data.position,
        email: data.email,
        phone: data.phone,
        website: data.website,
        address: data.address,
        counselors: data.counselors,
        clients: data.clients,
        features: data.features,
        demoTime: data.demoTime,
        notes: data.notes,
        typedName: data.typedName,
        signature: data.signature,
        date: data.date,
      };
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('onboarding_requests')
        .insert(insertData);
      return { message: 'Onboarding request created successfully', id: result[0] };
    } catch (error) {
      logger.error('Error creating onboarding request', error);
      return { message: 'Error creating onboarding request', error: -1 };
    }
  }
} 