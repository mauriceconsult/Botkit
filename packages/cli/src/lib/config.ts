// packages/cli/src/lib/config.ts
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";

const configFilePath = join(homedir(), ".config", "botkit", "config.json");

const cliConfigSchema = z.object({
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.number().optional(), // epoch ms
  remoteMcpUrl: z.string().optional(),
});
export type CliConfig = z.infer<typeof cliConfigSchema>;

export function loadConfig(): CliConfig {
  if (!existsSync(configFilePath)) return {};
  try {
    const parsed = JSON.parse(readFileSync(configFilePath, "utf-8"));
    const validated = cliConfigSchema.safeParse(parsed);
    return validated.success ? validated.data : {};
  } catch {
    return {};
  }
}

export function saveConfig(config: CliConfig) {
  const validated = cliConfigSchema.safeParse(config);
  if (!validated.success) {
    console.warn("Refused to save invalid config:", validated.error.message);
    return;
  }
  mkdirSync(dirname(configFilePath), { recursive: true, mode: 0o700 });
  writeFileSync(configFilePath, JSON.stringify(validated.data, null, 2), {
    mode: 0o600,
  });
}

export function clearConfig() {
  saveConfig({});
}
