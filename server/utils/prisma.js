/**
 * Prisma Client Singleton
 * 
 * This module exports a singleton Prisma Client instance that can be reused
 * across your application. It handles graceful shutdown and provides
 * development logging.
 * 
 * Uses a global singleton pattern to prevent multiple instances even with
 * hot module reloading in development.
 * 
 * Usage:
 *   import prisma from './utils/prisma.js';
 *   
 *   const users = await prisma.user.findMany();
 */

import { PrismaClient } from '@prisma/client';

// Global singleton pattern to prevent multiple instances
// This works even with hot module reloading in development
const globalForPrisma = globalThis;

// Check if Prisma instance already exists in global scope
// If not, create a new one and store it globally
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
  });
  
  // Log instance creation (only once)
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Prisma Client instance created (singleton)');
  }
}

// Use the global instance
const prisma = globalForPrisma.prisma;

// Handle graceful shutdown (only register once)
if (!globalForPrisma.prismaShutdownRegistered) {
  const gracefulShutdown = async () => {
    await prisma.$disconnect();
  };

  process.on('beforeExit', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  
  globalForPrisma.prismaShutdownRegistered = true;
}

export default prisma;

