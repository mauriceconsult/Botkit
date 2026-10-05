import { Hono, type Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { verifyToken } from "@clerk/backend";
import {
  generateClerkProtectedResourceMetadata,
  generateProtectedResourceMetadata,
} from "@clerk/mcp-tools/server";

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY?.trim().replace(
  /^['"]|['"]$/g,
  "",
);
const clerkFrontendApi = process.env.CLERK_FRONTEND_API?.trim().replace(
  /^['"]|['"]$/g,
  "",
);
const clerkSecretKey = process.env.CLERK_SECRET_KEY?.trim().replace(
  /^['"]|['"]$/g,
  "",
);
const RESOURCE_URL =
  process.env.MCP_RESOURCE_URL ?? "http://localhost:3001/mcp";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .filter(Boolean);

const VALID_KINDS = ["ai_byok", "ai_routed", "product_oauth"] as const;
type ConnectionKind = (typeof VALID_KINDS)[number];

function isValidKind(value: unknown): value is ConnectionKind {
  return (
    typeof value === "string" &&
    (VALID_KINDS as readonly string[]).includes(value)
  );
}

const VALID_PROVIDERS = [
  "anthropic",
  "openai",
  "google",
  "maxintel",
  "instaskul",
  "dukaboda",
  "zuria",
] as const;

type ConnectionProvider = (typeof VALID_PROVIDERS)[number];

function isValidProvider(value: unknown): value is ConnectionProvider {
  return (
    typeof value === "string" &&
    (VALID_PROVIDERS as readonly string[]).includes(value)
  );
}

export const app = new Hono();

function sendUnauthorized(c: Context) {
  const resourceBase = RESOURCE_URL.replace(/\/mcp$/, "");
  c.header(
    "WWW-Authenticate",
    `Bearer realm="${resourceBase}", resource_metadata="${resourceBase}/.well-known/oauth-protected-resource"`,
  );
  return c.json({ error: "Unauthorized" }, 401);
}

async function verifyClerkToken(token: string) {
  if (!clerkSecretKey) return undefined;
  try {
    return await verifyToken(token, {
      secretKey: clerkSecretKey,
      authorizedParties: ALLOWED_ORIGINS,
    });
  } catch {
    return undefined;
  }
}

app.get("/.well-known/oauth-protected-resource", (c) => {
  if (clerkFrontendApi?.startsWith("https://")) {
    return c.json(
      generateProtectedResourceMetadata({
        authServerUrl: clerkFrontendApi,
        resourceUrl: RESOURCE_URL,
      }),
    );
  }
  if (!clerkPublishableKey) {
    return c.json(
      { error: "Configure CLERK_PUBLISHABLE_KEY or CLERK_FRONTEND_API" },
      503,
    );
  }
  return c.json(
    generateClerkProtectedResourceMetadata({
      publishableKey: clerkPublishableKey,
      resourceUrl: RESOURCE_URL,
    }),
  );
});

app.all("/mcp", async (c) => {
  const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return sendUnauthorized(c);
  if (!clerkSecretKey) {
    return c.json({ error: "CLERK_SECRET_KEY is not configured" }, 503);
  }

  const verification = await verifyClerkToken(token);
  if (!verification || verification.errors || !verification.data) {
    return sendUnauthorized(c);
  }

  const claims = verification.data as { sub?: unknown };
  const userId = typeof claims.sub === "string" ? claims.sub : undefined;
  if (!userId) return sendUnauthorized(c);

  const server = new McpServer({ name: "botkit-remote-mcp", version: "0.0.1" });
  const { registerAllTools } = await import("@botkit/mcp-tools");
  registerAllTools(server, { userId });

  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return transport.handleRequest(c);
});

app.post("/connections", async (c) => {
  const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return sendUnauthorized(c);
  if (!clerkSecretKey) {
    return c.json({ error: "CLERK_SECRET_KEY is not configured" }, 503);
  }

  const verification = await verifyClerkToken(token);
  if (!verification || verification.errors || !verification.data) {
    return sendUnauthorized(c);
  }

  const claims = verification.data as { sub?: string };
  if (!claims.sub) return sendUnauthorized(c);

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return c.json({ error: "Invalid connection body" }, 400);
  }

  const { provider, kind, tokens } = body as {
    provider?: unknown;
    kind?: unknown;
    tokens?: unknown;
  };

  if (!isValidProvider(provider) || !isValidKind(kind)) {
    return c.json({ error: "Invalid connection body" }, 400);
  }

  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
    return c.json({ error: "Invalid connection body" }, 400);
  }

  const { saveConnection } = await import("@botkit/core");
  await saveConnection(claims.sub, provider, kind, tokens);
  return c.json({ status: "ok" });
});

app.get("/health", (c) => c.json({ status: "ok" }));
app.notFound((c) => c.json({ error: "Not Found" }, 404));

export default app;