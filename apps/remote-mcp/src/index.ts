import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { verifyToken } from "@clerk/backend";
import { registerAllTools } from "../../../packages/mcp-tools/src";
import { generateClerkProtectedResourceMetadata } from "@clerk/mcp-tools/server";

const RESOURCE_URL =
  process.env.MCP_RESOURCE_URL ?? "http://localhost:3001/mcp";

const app = new Hono();

// ── RFC 9728 discovery endpoint — unauthenticated, tells MCP clients where to log in ──
app.get("/.well-known/oauth-protected-resource", (c) =>
  c.json(
    generateClerkProtectedResourceMetadata({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
      resourceUrl: RESOURCE_URL,
    }),
  ),
);

// ── MCP endpoint — Clerk-authenticated ──────────────────────────────────────────────
app.all("/mcp", async (c) => {
  const authHeader = c.req.header("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    c.header(
      "WWW-Authenticate",
      `Bearer resource_metadata="${RESOURCE_URL.replace(/\/mcp$/, "")}/.well-known/oauth-protected-resource"`,
    );
    return c.json({ error: "Unauthorized" }, 401);
  }

  let claims;
  try {
    claims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  // Fresh McpServer + transport per request — required for stateless safety.
  // Reusing a single instance across concurrent requests is the exact pattern
  // behind CVE-2026-25536 (cross-client response leak in stateless deployments).
  // This also happens to be the cleanest way to close over the authenticated
  // user's id for every tool call in this request, with no extra plumbing.
  const server = new McpServer({ name: "botkit-remote-mcp", version: "0.0.1" });
  registerAllTools(server, { userId: claims.sub });

  const transport = new StreamableHTTPTransport();
  await server.connect(transport);

  return transport.handleRequest(c);
});

app.get("/health", (c) => c.json({ status: "ok" }));

export default app;

// Bun's native entrypoint when run directly (bun run index.ts), not when imported
if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3001);
  Bun.serve({ port, fetch: app.fetch });
  console.log(`Botkit remote MCP server running on :${port}`);
}
