import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateMaxintelText } from "../../core/src/clients/maxintel";

export function registerAllTools(server: McpServer) {
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

  // future: registerDukabodaTools(server), registerInstaskulTools(server), etc.
  // as core grows, split this file into one register*Tools() per product
  // and call them all here — keeps this file from becoming unmanageable.
}
