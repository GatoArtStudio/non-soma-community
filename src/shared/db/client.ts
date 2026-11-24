import "server-only";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { getDatabaseConnection, getEnv } from "@/shared/config/env";
import * as schema from "./schema";

export type Database = MySql2Database<typeof schema>;

const globalForDb = globalThis as unknown as { nonSomaDb?: Database };

export function getDb(): Database {
  if (!globalForDb.nonSomaDb) {
    const pool = mysql.createPool({
      ...getDatabaseConnection(getEnv()),
      connectionLimit: 10,
      timezone: "Z",
    });
    globalForDb.nonSomaDb = drizzle(pool, { schema, mode: "default" });
  }
  return globalForDb.nonSomaDb;
}

export function isDuplicateKeyError(error: unknown): boolean {
  const cause = (error as { cause?: { code?: string } })?.cause ?? error;
  return (cause as { code?: string })?.code === "ER_DUP_ENTRY";
}
