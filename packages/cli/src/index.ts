// packages/cli/src/index.ts
import { Command } from "commander";
import { loadConfig, saveConfig, clearConfig } from "./lib/config.js";
import { runOAuthConnect, runOAuthLogin } from "./lib/oauth.js";

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

  // packages/cli — new command
program
  .command("connect")
  .command("instaskul")
  .action(async () => {
    const config = loadConfig();
    if (!config.accessToken) {
      console.error("Not logged in. Run `botkit login` first.");
      process.exit(1);
    }

    const instaskulTokens = await runOAuthConnect({
      frontendApi: process.env.INSTASKUL_CLERK_FRONTEND_API!,
      clientId: process.env.INSTASKUL_CLERK_OAUTH_CLIENT_ID!,
      callbackPort: 4322,
    });

    const res = await fetch(
      `${process.env.BOTKIT_REMOTE_MCP_URL}/connections`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.accessToken}`,
        },
        body: JSON.stringify({
          provider: "instaskul",
          kind: "product_oauth",
          tokens: instaskulTokens,
        }),
      },
    );
    if (!res.ok) {
      console.error("Failed to save connection:", await res.text());
      process.exit(1);
    }
    console.log("Instaskul connected.");
  });
