//config/server.config.js

import Express from 'express';
import fs from 'fs';
import winston from 'winston';
import bodyParser from 'body-parser';
import DbConfig from './db.config.js';
import http from 'http';
import https from 'https';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

export default class ServerConfig {
  constructor({ port, middlewares, routers }) {
    this.app = Express();
    this.app.set('env', process.env.NODE_ENV);
    this.port = port;
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Serve static files from public directory
    this.app.use('/', Express.static(path.join(__dirname, 'public')));
    
    // Serve static files from uploads directory
    this.app.use('/uploads', Express.static(path.join(__dirname, '../../uploads')));

    this.app.use(cors({
      origin: 'http://localhost:3000',
      credentials: true, // if you use cookies or authorization headers
    }));

    middlewares?.forEach((mdlw) => {
      this.registerMiddleware(mdlw);
    });

    this.app.get('/ping', (req, res) => {
      res.send('pong');
    });

    routers?.forEach(({ baseUrl, router }) => {
      this.registerRouter(baseUrl, router);
    });

    this.registerMiddleware(
      // Catch 404 and forward to error handler
      (req, res, next) => {
        const err = new Error('Not Found');
        err.statusCode = 404;
        next(err);
      },
    );

    this.registerErrorHandlingMiddleware();

    // Setup the winston console as an instance property
    this.console = winston.createLogger({
      level: 'info',
      transports: [
        // Log errors to a file inside the logs folder
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.align(),
            winston.format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}`,
            ),
          ),
        }),
        // Log to console as well
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.align(),
            winston.format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}`,
            ),
          ),
        }),
      ],
    });
  }

  registerMiddleware(middleware) {
    this.app.use(middleware);
    return this;
  }

  registerRouter(baseUrl, router) {
    this.app.use(baseUrl, router);
    return this;
  }

  registerErrorHandlingMiddleware() {
    this.app.use((err, req, res, next) => {
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      
      // Ensure consistent error response format
      const errorResponse = {
        statusCode,
        message,
        error: true,
        timestamp: new Date().toISOString()
      };

      // Log the error with more details
      this.console.error({
        statusCode,
        message,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        stack: err.stack,
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Send the error response
      res.status(statusCode).json(errorResponse);
    });
  }

  async listen() {
    try {
      const options = {
        key: fs.readFileSync(process.env.SLS_DOT_COM_KEY),
        cert: fs.readFileSync(process.env.SLS_DOT_COM_CERT),
      };

      const { default: knex } = await import('knex');
      const db = knex(DbConfig.dbConn.development);
      
      // Test database connection
      try {
        await db.raw('SELECT 1');
        this.console.info('✅ Database connection successful');
      } catch (error) {
        this.console.error('❌ Database connection failed:', {
          message: error.message,
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage
        });
        throw error;
      }
      
      this.app.locals.knex = db;

      // Create an HTTP/HTTPS server
      const httpServer =
        process.env.NODE_ENV === 'local_development'
          ? http.createServer(options, this.app)
          : https.createServer(options, this.app);

      process.env.NODE_ENV === 'development'
        ? https.createServer(options, this.app)
        : https.createServer(options, this.app);

      httpServer.listen(this.port, () => {
        this.console.info(`🚀..Server running on port: ${this.port}`);
      });
    } catch (error) {
      this.console.error(`Error: ${error.message}`);
    }
  }
}
