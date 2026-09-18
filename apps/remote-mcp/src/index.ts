import { Hono, type Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { verifyToken } from "@clerk/backend";
import { generateClerkProtectedResourceMetadata } from "@clerk/mcp-tools/server";
import { registerAllTools } from "@botkit/mcp-tools";

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkPublishableKey || !clerkSecretKey) {
  throw new Error(
    "Missing Clerk keys. Set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in your environment.",
  );
}

const RESOURCE_URL =
  process.env.MCP_RESOURCE_URL ?? "http://localhost:3001/mcp";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .filter(Boolean);

export const app = new Hono();

function sendUnauthorized(c: Context) {
  c.header(
    "WWW-Authenticate",
    `Bearer resource_metadata="${RESOURCE_URL.replace(/\/mcp$/, "")}/.well-known/oauth-protected-resource"`,
  );
  return c.json({ error: "Unauthorized" }, 401);
}

// ── RFC 9728 discovery endpoint — unauthenticated ──────────────────────────────────
app.get("/.well-known/oauth-protected-resource", (c) =>
  c.json(
    generateClerkProtectedResourceMetadata({
      publishableKey: clerkPublishableKey,
      resourceUrl: RESOURCE_URL,
    }),
  ),
);

// ── MCP endpoint — Clerk-authenticated ──────────────────────────────────────────────
app.all("/mcp", async (c) => {
  const authHeader = c.req.header("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return sendUnauthorized(c);

  let verification;
  try {
    verification = await verifyToken(token, {
      secretKey: clerkSecretKey,
      authorizedParties: ALLOWED_ORIGINS,
    });
  } catch {
    return sendUnauthorized(c);
  }

  const claims =
    verification && "data" in verification && verification.data
      ? (verification.data as { sub?: string })
      : undefined;

  if (!claims?.sub || verification.errors) return sendUnauthorized(c);

  // Fresh McpServer + transport per request — required for stateless safety
  // (CVE-2026-25536: shared instances leak responses across concurrent clients),
  // and the cleanest way to close over this request's authenticated userId.
  const server = new McpServer({ name: "botkit-remote-mcp", version: "0.0.1" });
  registerAllTools(server, { userId: claims.sub });

  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return transport.handleRequest(c);
});

app.get("/health", (c) => c.json({ status: "ok" }));
app.notFound((c) => c.json({ error: "Not Found" }, 404));

const port = Number(process.env.PORT ?? 3001);

export default {
  port,
  fetch: (req: Request) => {
    const url = new URL(req.url);
    url.protocol = req.headers.get("x-forwarded-proto") ?? url.protocol;
    url.host = req.headers.get("x-forwarded-host") ?? url.host;
    return app.fetch(new Request(url.toString(), req));
  },
};
