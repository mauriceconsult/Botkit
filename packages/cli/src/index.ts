// packages/cli/src/index.ts
import { Command } from "commander";
import { loadConfig, saveConfig, clearConfig } from "./lib/config.js";
import { runOAuthLogin } from "./lib/oauth.js";


const program = new Command();
program.name("botkit").description("Botkit CLI");

program
  .command("login")
  .description("Log in to Botkit with your account")
  .action(async () => {
    const { accessToken, refreshToken, expiresAt } = await runOAuthLogin();
    saveConfig({ accessToken, refreshToken, expiresAt });
    console.log("Logged in.");
  });

program
  .command("logout")
  .description("Log out and clear stored credentials")
  .action(() => {
    clearConfig();
    console.log("Logged out.");
  });

program
  .command("whoami")
  .description("Show the currently logged-in account")
  .action(() => {
    const config = loadConfig();
    if (!config.accessToken) {
      console.log("Not logged in. Run `botkit login`.");
      return;
    }
    console.log("Logged in."); // decode/introspect token for real identity once wired to remote-mcp
  });

program
  .command("maxintel")
  .description("Generate AI text via Maxintel")
  .argument("<prompt>", "The prompt to generate from")
  .action(async (prompt: string) => {
    const config = loadConfig();
    if (!config.accessToken) {
      console.error("Not logged in. Run `botkit login` first.");
      process.exit(1);
    }
    // call apps/remote-mcp's /mcp endpoint as an MCP client, Authorization: Bearer <accessToken>
    // not packages/core directly — see note above on why
  });

await program.parseAsync(process.argv).catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
