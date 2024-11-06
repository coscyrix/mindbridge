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
      max: 100,
      min: 0,
      //acquire: 30000,
      //idle: 10000,
    },
    debug: true,
  },
};

// Use the ES Module syntax for exports
export default {
  dbConn,
};
