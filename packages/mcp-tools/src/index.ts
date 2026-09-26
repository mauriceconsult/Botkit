// packages/mcp-tools/src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMaxintelTools } from "./maxintel.js";
import { registerInstaskulTools } from "./instaskul.js";
import type { ToolContext } from "./types.js";

export type { ToolContext };

export function registerAllTools(server: McpServer, ctx: ToolContext) {
  registerMaxintelTools(server, ctx);
  registerInstaskulTools(server, ctx);
  // registerDukabodaTools / registerZuriaTools once each has a real OAuth Application,
  // real platform routes, and a verified core client — same full treatment Instaskul just went through
}
