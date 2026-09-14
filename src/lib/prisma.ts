import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Reuse the client cached across dev hot reloads, unless `prisma generate` has
// run since: the reload then brings a new PrismaClient class, and a client built
// from the old one would silently ignore new models and columns.
function getPrismaClient() {
  // `unknown`: a client from a previous generation isn't an instance of today's type.
  const cached: unknown = globalForPrisma.prisma;
  if (cached instanceof PrismaClient) return cached;
  void (cached as { $disconnect?: () => Promise<void> } | undefined)?.$disconnect?.();
  return createPrismaClient();
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
