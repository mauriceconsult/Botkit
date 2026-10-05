import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMaxintelTools } from "./maxintel.js";
import { registerInstaskulTools } from "./instaskul.js";
import { registerZuriaTools } from "./zuria.js";
import type { ToolContext } from "./types.js";

export type { ToolContext };

export function registerAllTools(server: McpServer, ctx: ToolContext) {
  registerMaxintelTools(server, ctx);
  registerInstaskulTools(server, ctx);
  registerZuriaTools(server, ctx);
  // registerDukabodaTools once it gets the same full treatment
}
