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
    const uploadsPath = path.join(process.cwd(), 'uploads');
    // Ensure uploads directory exists before serving static files
    if (!fs.existsSync(uploadsPath)) {
      try {
        fs.mkdirSync(uploadsPath, { recursive: true });
      } catch (error) {
        console.error('Warning: Could not create uploads directory:', error.message);
      }
    }
    this.app.use('/uploads', Express.static(uploadsPath));

    // CORS configuration
    const corsOptions = {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all origins for development
        if (process.env.NODE_ENV === 'development' || process.env.ALLOWED_ORIGINS === '*') {
          return callback(null, true);
        }
        
        // Check if origin is in allowed list
        const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'ngrok-skip-browser-warning'],
      exposedHeaders: ['Content-Length', 'X-Requested-With'],
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    this.app.use(cors(corsOptions));

    // Additional CORS headers for better compatibility
    this.app.use((req, res, next) => {
      // Log CORS requests for debugging
      console.log(`CORS Request: ${req.method} ${req.originalUrl} from ${req.get('Origin') || 'Unknown Origin'}`);
      
      // Set CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, ngrok-skip-browser-warning');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400'); // 24 hours
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      next();
    });

    middlewares?.forEach((mdlw) => {
      this.registerMiddleware(mdlw);
    });

    this.app.get('/ping', (req, res) => {
      res.json({
        message: 'pong',
        timestamp: new Date().toISOString(),
        port: this.port,
        processId: process.pid
      });
    });

    // Health check endpoint for CORS testing
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        message: 'Server is running and accepting requests from all origins',
        timestamp: new Date().toISOString(),
        port: this.port,
        processId: process.pid,
        cors: {
          allowedOrigins: process.env.ALLOWED_ORIGINS || '*',
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'ngrok-skip-browser-warning']
        }
      });
    });

    // CORS test endpoint
    this.app.get('/api/cors-test', (req, res) => {
      res.json({
        message: 'CORS is working!',
        timestamp: new Date().toISOString(),
        origin: req.get('Origin'),
        method: req.method
      });
    });

    // Auth test endpoint
    this.app.post('/api/auth/test', (req, res) => {
      res.json({
        message: 'Auth endpoint is accessible',
        timestamp: new Date().toISOString(),
        body: req.body
      });
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
        // key: fs.readFileSync(process.env.SLS_DOT_COM_KEY),
        // cert: fs.readFileSync(process.env.SLS_DOT_COM_CERT),
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

      // Create an HTTP server (simplified for Docker)
      const httpServer = http.createServer(this.app);

      // Add graceful shutdown handling
      const gracefulShutdown = (signal) => {
        this.console.info(`Received ${signal}. Starting graceful shutdown...`);
        httpServer.close(() => {
          this.console.info('HTTP server closed.');
          process.exit(0);
        });
      };

      // Listen for shutdown signals
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

      httpServer.listen(this.port, () => {
        this.console.info(`🚀..Server running on port: ${this.port}`);
      });
    } catch (error) {
      this.console.error(`Error: ${error.message}`);
    }
  }
}
