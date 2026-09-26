import { randomBytes, createHash } from "node:crypto";
import { createServer } from "node:http";
import { exec } from "node:child_process";
import { URL } from "node:url";

const CLERK_FRONTEND_API = process.env.CLERK_FRONTEND_API; // e.g. https://your-instance.clerk.accounts.dev
const CLERK_OAUTH_CLIENT_ID = process.env.CLERK_OAUTH_CLIENT_ID; // Botkit CLI's OWN OAuth Application — see note below
const CALLBACK_PORT = 4321; // deliberately different from Maxintel's 4001, in case both run locally at once
const REDIRECT_URI = `http://127.0.0.1:${CALLBACK_PORT}/callback`;
const SCOPES = "openid email profile offline_access";

if (!CLERK_FRONTEND_API || !CLERK_OAUTH_CLIENT_ID) {
  throw new Error(
    "Missing CLERK_FRONTEND_API or CLERK_OAUTH_CLIENT_ID. Set them before running `botkit login`.",
  );
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generatePkcePair() {
  const codeVerifier = base64UrlEncode(randomBytes(32));
  const codeChallenge = base64UrlEncode(
    createHash("sha256").update(codeVerifier).digest(),
  );
  return { codeVerifier, codeChallenge };
}

function openBrowser(url: string) {
  const cmd =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.log(`Open this URL to log in:\n${url}`);
  });
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch ms
}

export interface OAuthConnectConfig {
  frontendApi: string;
  clientId: string;
  callbackPort: number;
  scopes?: string;
}

export async function runOAuthConnect(
  config: OAuthConnectConfig,
): Promise<OAuthTokens> {
  const {
    frontendApi,
    clientId,
    callbackPort,
    scopes = "openid email profile offline_access",
  } = config;
  const redirectUri = `http://127.0.0.1:${callbackPort}/callback`;
  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = base64UrlEncode(randomBytes(16));

  const authorizeUrl = new URL(`${frontendApi}/oauth/authorize`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", scopes);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("prompt", "login");

  const code = await new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      const reqUrl = new URL(req.url ?? "", redirectUri);
      if (reqUrl.pathname !== "/callback") {
        res.writeHead(404).end();
        return;
      }
      const returnedState = reqUrl.searchParams.get("state");
      const returnedCode = reqUrl.searchParams.get("code");
      const error = reqUrl.searchParams.get("error");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        error
          ? `<h1>Failed</h1><p>${error}</p>`
          : `<h1>Connected</h1><p>You can close this tab.</p>`,
      );
      server.close();
      if (error) return reject(new Error(`OAuth error: ${error}`));
      if (returnedState !== state) return reject(new Error("State mismatch"));
      if (!returnedCode) return reject(new Error("No authorization code"));
      resolve(returnedCode);
    });
    server.listen(callbackPort, "127.0.0.1", () => {
      console.log("Opening your browser...");
      openBrowser(authorizeUrl.toString());
    });
    server.on("error", reject);
  });

  const tokenRes = await fetch(`${frontendApi}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
    }),
  });
  if (!tokenRes.ok)
    throw new Error(
      `Token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`,
    );

  const data = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

// runOAuthLogin now just calls this with Botkit's own fixed config, no offline_access (confirmed unsupported for that app)
export function runOAuthLogin() {
  return runOAuthConnect({
    frontendApi: process.env.CLERK_FRONTEND_API!,
    clientId: process.env.CLERK_OAUTH_CLIENT_ID!,
    callbackPort: 4321,
    scopes: "openid email profile",
  });
}