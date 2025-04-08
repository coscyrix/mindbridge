// Use import instead of require for dotenv
import dotenv from 'dotenv';
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
    },
    pool: {
      max: 50,
      min: 0,
      idleTimeoutMillis: 10000, // Supported Tarn.js option
      acquireTimeoutMillis: 20000, // Supported Tarn.js option
    },
    acquireConnectionTimeout: 10000, // Wait up to 10 seconds to establish a connection
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
    },
    pool: {
      max: 50,
      min: 0,
      idleTimeoutMillis: 10000, // Supported Tarn.js option
      acquireTimeoutMillis: 20000, // Supported Tarn.js option
    },
    acquireConnectionTimeout: 10000, // Wait up to 10 seconds to establish a connection
    debug: false,
  },
};

// Use the ES Module syntax for exports
export default {
  dbConn,
};
