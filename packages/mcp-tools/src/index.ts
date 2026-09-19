import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateMaxintelText } from "../../core/src/clients/maxintel";
import { postDukabodaDelivery } from "../../core/src/clients/dukaboda";
import { postInstaskulAnnouncement } from "../../core/src/clients/instakul";
import { postZuriaListing } from "../../core/src/clients/zuria";

export interface ToolContext {
  userId: string;
}

export function registerAllTools(server: McpServer, ctx: ToolContext) {
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

  server.registerTool(
    "instaskul_post_announcement",
    {
      title: "Post Instaskul Announcement",
      description: "Post an announcement to an Instaskul class.",
      inputSchema: {
        classId: z.string(),
        title: z.string(),
        content: z.string(),
      },
    },
    async ({ classId, title, content }) => {
      const result = await postInstaskulAnnouncement({
        classId,
        title,
        content,
      });
      return {
        content: [{ type: "text" as const, text: `Posted (id: ${result.id})` }],
      };
    },
  );

  server.registerTool(
    "zuria_post_listing",
    {
      title: "Post Zuria Listing",
      description: "Post a new product listing on Zuria/Vendly.",
      inputSchema: {
        title: z.string(),
        description: z.string(),
        price: z.number(),
        category: z.string().optional(),
      },
    },
    async (params) => {
      const result = await postZuriaListing(params);
      return {
        content: [{ type: "text" as const, text: `Listed (id: ${result.id})` }],
      };
    },
  );

  server.registerTool(
    "dukaboda_post_delivery",
    {
      title: "Post Dukaboda Delivery Request",
      description: "Create a new delivery request on Dukaboda.",
      inputSchema: {
        pickupAddress: z.string(),
        dropoffAddress: z.string(),
        description: z.string().optional(),
      },
    },
    async (params) => {
      const result = await postDukabodaDelivery(params);
      return {
        content: [
          {
            type: "text" as const,
            text: `Delivery requested (id: ${result.id})`,
          },
        ],
      };
    },
  );
}
