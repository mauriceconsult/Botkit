import { Hono, type Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { verifyToken } from "@clerk/backend";
import {
  generateClerkProtectedResourceMetadata,
  generateProtectedResourceMetadata,
} from "@clerk/mcp-tools/server";
import { registerAllTools } from "@botkit/mcp-tools";

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
if (!clerkPublishableKey || !clerkSecretKey) {
  throw new Error("Missing CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY");
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

app.get("/.well-known/oauth-protected-resource", (c) =>
  c.json(
    clerkFrontendApi?.startsWith("https://")
      ? generateProtectedResourceMetadata({
          authServerUrl: clerkFrontendApi,
          resourceUrl: RESOURCE_URL,
        })
      : generateClerkProtectedResourceMetadata({
          publishableKey: clerkPublishableKey,
          resourceUrl: RESOURCE_URL,
        }),
  ),
);

app.all("/mcp", async (c) => {
  const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return sendUnauthorized(c);

  const verification = await verifyToken(token, {
    secretKey: clerkSecretKey,
    authorizedParties: ALLOWED_ORIGINS,
  });

  if (verification.errors || !verification.data) return sendUnauthorized(c);

  const claims = verification.data as { sub?: unknown };
  const userId = typeof claims.sub === "string" ? claims.sub : undefined;
  if (!userId) return sendUnauthorized(c);

  const server = new McpServer({ name: "botkit-remote-mcp", version: "0.0.1" });
  registerAllTools(server, { userId });

  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return transport.handleRequest(c);
});

app.get("/health", (c) => c.json({ status: "ok" }));
app.notFound((c) => c.json({ error: "Not Found" }, 404));

export default app;
