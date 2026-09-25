import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateMaxintelText } from "../../core/src/clients/maxintel";
import type { ToolContext } from "./types.js";

export function registerMaxintelTools(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "maxintel_generate",
    {
      title: "Generate with Maxintel",
      description:
        "Generate AI text via Maxintel's routed model (credit-metered).",
      inputSchema: {
        prompt: z.string(),
        model: z.string().optional(),
        system: z.string().optional(),
        maxTokens: z.number().optional(),
      },
    },
    async ({ prompt, model, system, maxTokens }) => {
      const result = await generateMaxintelText({
        prompt,
        model,
        system,
        maxTokens,
      });
      return { content: [{ type: "text" as const, text: result.output }] };
    },
  );
}
