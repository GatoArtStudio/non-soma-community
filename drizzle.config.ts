import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "mysql",
  schema: "./src/shared/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "mysql://non_soma:non_soma@localhost:3306/non_soma",
  },
  strict: true,
  verbose: true,
});
