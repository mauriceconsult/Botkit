import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generateMaxintelText } from "@botkit/core/clients/maxintel.js";

const server = new McpServer({
  name: "maxnovate-mcp",
  version: "0.0.1",
});

server.registerTool(
  "maxintel_generate",
  {
    title: "Generate with Maxintel",
    description:
      "Generate AI text via Maxintel's routed model (Anthropic/OpenAI/Gemini failover, credit-metered).",
    inputSchema: {
      prompt: z.string().describe("The prompt to generate from"),
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
    const warningText = result.warning ? `\n⚠️ ${result.warning.message}` : "";
    return {
      content: [
        {
          type: "text" as const,
          text: `${result.output}\n\n(${result.totalTokens} tokens · ${result.creditsUsed} credits used · ${result.creditsRemaining} remaining)${warningText}`,
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Maxnovate MCP server running on stdio");
