// Infrastructure: Prisma Client Singleton

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;
let pgPool: Pool | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pgPool);

    prismaInstance = new PrismaClient({
      adapter,
      log: ['error'],
    });
  }
  return prismaInstance;
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
}
