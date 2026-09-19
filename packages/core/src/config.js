import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// packages/core/src -> ../../.. = monorepo root
loadEnv({ path: path.resolve(__dirname, "../../../.env") });
const envSchema = z.object({
    PLATFORM_API_URL: z.string().url(),
    PLATFORM_API_KEY: z.string().min(1),
});
export const config = envSchema.parse(process.env);
