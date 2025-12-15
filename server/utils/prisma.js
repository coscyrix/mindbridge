/**
 * Prisma Client Singleton
 * 
 * This module exports a singleton Prisma Client instance that can be reused
 * across your application. It handles graceful shutdown and provides
 * development logging.
 * 
 * Usage:
 *   import prisma from './utils/prisma.js';
 *   
 *   const users = await prisma.user.findMany();
 */

import { PrismaClient } from '@prisma/client';

// Create Prisma Client instance with appropriate logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
  await prisma.$disconnect();
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default prisma;

