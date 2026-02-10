import { config } from "dotenv";

config({ path: "./.env.production" });

import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle",
    dialect: "postgresql",
    schema: "./src/server/db/schema.ts",
    dbCredentials: {
        url: process.env.PRODUCTION_DATABASE_URL!,
    },
});