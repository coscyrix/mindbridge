import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;
import logger from '../config/winston.js';
const dotenv = require('dotenv');;
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
        contact_number: data.contact_number,
        website: data.website,
        address: data.address,
        counselors: data.counselors,
        clients: data.clients,
        features: data.features,
        demoTime: data.demoTime,
        notes: data.notes,
        description: data.description,
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