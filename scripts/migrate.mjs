import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

// Mirrors getDatabaseConnection in src/shared/config/env.ts: discrete credentials first, URL as fallback.
function connectionOptions() {
  const env = process.env;
  if (env.DATABASE_HOST) {
    return {
      host: env.DATABASE_HOST,
      port: Number(env.DATABASE_PORT ?? 3306),
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
    };
  }
  if (env.DATABASE_URL) return { uri: env.DATABASE_URL };
  console.error("Configure DATABASE_HOST (with credentials) or DATABASE_URL to run migrations");
  process.exit(1);
}

const options = connectionOptions();

const MAX_ATTEMPTS = 20;

async function connectWithRetry() {
  for (let attempt = 1; ; attempt++) {
    try {
      const connection = await mysql.createConnection({ ...options, multipleStatements: true });
      await connection.ping();
      return connection;
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS) throw error;
      console.log(
        `Database not ready (attempt ${attempt}/${MAX_ATTEMPTS}): ${error.code ?? error.message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

const connection = await connectWithRetry();
try {
  await migrate(drizzle(connection), {
    migrationsFolder: new URL("../drizzle", import.meta.url).pathname,
  });
  console.log("Migrations applied");
} finally {
  await connection.end();
}
