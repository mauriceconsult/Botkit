import { Hono, type Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { createClerkClient } from "@clerk/backend";
import { generateClerkProtectedResourceMetadata } from "@clerk/mcp-tools/server";
import { registerAllTools } from "@botkit/mcp-tools";
import { saveConnection } from "@botkit/core";
// import { saveConnection } from "@botkit/core/connections.js"; // adjust path if different

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkPublishableKey || !clerkSecretKey) {
  throw new Error("Missing CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY");
}

const clerkClient = createClerkClient({ secretKey: clerkSecretKey });

const RESOURCE_URL =
  process.env.MCP_RESOURCE_URL ?? "http://localhost:3001/mcp";

export const app = new Hono();

function sendUnauthorized(c: Context) {
  c.header(
    "WWW-Authenticate",
    `Bearer resource_metadata="${RESOURCE_URL.replace(/\/mcp$/, "")}/.well-known/oauth-protected-resource"`,
  );
  return c.json({ error: "Unauthorized" }, 401);
}

app.get("/.well-known/oauth-protected-resource", (c) =>
  c.json(
    generateClerkProtectedResourceMetadata({
      publishableKey: clerkPublishableKey,
      resourceUrl: RESOURCE_URL,
    }),
  ),
);

app.all("/mcp", async (c) => {
  const { isAuthenticated, toAuth } = await clerkClient.authenticateRequest(
    c.req.raw,
    {
      acceptsToken: "oauth_token",
    },
  );
  if (!isAuthenticated) return sendUnauthorized(c);
  const { userId } = toAuth();
  if (!userId) return sendUnauthorized(c);

  const server = new McpServer({ name: "botkit-remote-mcp", version: "0.0.1" });
  registerAllTools(server, { userId });
  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return transport.handleRequest(c);
});

const allowedProviders = [
  "anthropic",
  "dukaboda",
  "google",
  "instaskul",
  "maxintel",
  "openai",
  "zuria",
] as const;
type ConnectionProvider = (typeof allowedProviders)[number];
const allowedKinds = ["ai_byok", "ai_routed", "product_oauth"] as const;
type ConnectionKind = (typeof allowedKinds)[number];

function isValidProvider(value: unknown): value is ConnectionProvider {
  return (
    typeof value === "string" &&
    (allowedProviders as readonly string[]).includes(value)
  );
}
function isValidKind(value: unknown): value is ConnectionKind {
  return (
    typeof value === "string" &&
    (allowedKinds as readonly string[]).includes(value)
  );
}

app.post("/connections", async (c) => {
  try {
    const { isAuthenticated, toAuth } = await clerkClient.authenticateRequest(
      c.req.raw,
      {
        acceptsToken: "oauth_token",
      },
    );
    if (!isAuthenticated) return sendUnauthorized(c);
    const { userId } = toAuth();
    if (!userId) return sendUnauthorized(c);

    const { provider, kind, tokens } = await c.req.json();
    if (!isValidProvider(provider))
      return c.json({ error: `Invalid provider: ${provider}` }, 400);
    if (!isValidKind(kind))
      return c.json({ error: `Invalid kind: ${kind}` }, 400);

    await saveConnection(userId, provider, kind, tokens);
    return c.json({ status: "ok" });
  } catch (error) {
    console.error("[CONNECTIONS_POST]", error);
    return c.json(
      {
        error: "Internal error",
        detail: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      500,
    );
  }
});

app.get("/health", (c) => c.json({ status: "ok" }));
app.notFound((c) => c.json({ error: "Not Found" }, 404));

export default app;
