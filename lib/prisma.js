import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Switched from a direct, unpooled connection (DIRECT_URL via the
// PrismaPg adapter -- opening a fresh raw TCP connection to
// db.prisma.io for every single query, with no pooling at all) to
// Prisma Accelerate (DATABASE_URL, prisma+postgres://accelerate...).
// Accelerate is Prisma Postgres's own managed connection-pooling
// layer -- it's what @prisma/extension-accelerate is for, and it was
// already installed as a dependency but never actually wired in here.
//
// The direct-connection setup was almost certainly why every request
// was timing out (ETIMEDOUT) across the whole app: the homepage alone
// fires 10+ parallel Prisma queries on a single load, and each one was
// opening its own new connection straight to the database with no
// pool to reuse -- exactly the pattern that overwhelms a serverless
// Postgres instance, especially one that can idle and need a moment
// to wake up. Pooled, proxied connections through Accelerate are the
// supported way to run a Prisma Postgres app under real traffic.
//
// DIRECT_URL is left alone everywhere else (prisma.config.ts,
// schema.prisma's datasource) -- that's correctly used only by the
// Prisma CLI for schema migrations (db push, migrate, generate),
// which need a direct connection since Accelerate can't run DDL. Only
// this runtime app client changes.
//
// accelerateUrl is passed explicitly (rather than left to
// PrismaClient's default env resolution) because prisma/schema.prisma
// declares `datasource db { provider = "postgresql" }` with no `url`
// field at all -- prisma.config.ts supplies DIRECT_URL to the CLI at
// the config level, which a plain `new PrismaClient()` at runtime
// never reads. Without an explicit URL here, the client would have no
// connection string to use.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ accelerateUrl: connectionString }).$extends(
    withAccelerate()
  );

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
