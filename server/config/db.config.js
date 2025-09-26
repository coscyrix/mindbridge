// Use import instead of require for dotenv
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
dotenv.config();

const dbConn = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_URL,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      port: process.env.MYSQL_PORT,
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true,
      timezone: 'Z',
      dateStrings: true,
      connectTimeout: 120000, // 2 minutes connection timeout
    },
    pool: {
      max: 50,
      min: 0,
      idleTimeoutMillis: 30000, // Increased from 10000
      acquireTimeoutMillis: 60000, // Increased from 20000
    },
    acquireConnectionTimeout: 120000, // Increased from 50000 to 2 minutes
    debug: true,
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_URL,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      port: process.env.MYSQL_PORT,
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true,
      timezone: 'Z',
      dateStrings: true,
      connectTimeout: 120000, // 2 minutes connection timeout
    },
    pool: {
      max: 50,
      min: 0,
      idleTimeoutMillis: 30000, // Increased from 10000
      acquireTimeoutMillis: 60000, // Increased from 20000
    },
    acquireConnectionTimeout: 120000, // Increased from 30000 to 2 minutes
    debug: false,
  },
};

// Use the ES Module syntax for exports
export default {
  dbConn,
};
