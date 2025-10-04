/**
 * DATABASE CLIENT
 * 
 * Purpose:
 * Singleton Prisma client instance for database access.
 * 
 * Features:
 * - Reuses client in development (prevents connection exhaustion)
 * - Creates new client in production
 * - Enables query logging in development
 * 
 * Usage:
 * import { prisma } from '@/server/db';
 * await prisma.model.findMany();
 */

import { PrismaClient } from '@/generated/prisma';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

