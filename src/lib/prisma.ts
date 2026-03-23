import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

declare global {
  var __pulsePrisma: PrismaClient | undefined;
  var __pulsePrismaAdapter: PrismaBetterSqlite3 | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter =
  globalThis.__pulsePrismaAdapter ??
  new PrismaBetterSqlite3({
    url: connectionString,
  });

export const prisma =
  globalThis.__pulsePrisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__pulsePrismaAdapter = adapter;
  globalThis.__pulsePrisma = prisma;
}
