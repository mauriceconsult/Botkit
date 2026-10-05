import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as zuria from "@botkit/core/clients/zuria.js";
import type { ToolContext } from "./types.js";

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function registerZuriaTools(server: McpServer, ctx: ToolContext) {
  server.registerTool(
    "zuria_create_shop",
    { title: "Create Zuria Shop", description: "Create a new shop.", inputSchema: { name: z.string() } },
    async ({ name }) => textResult(JSON.stringify(await zuria.createZuriaShop(ctx.userId, name)))
  );
  server.registerTool(
    "zuria_list_shops",
    { title: "List Zuria Shops", description: "List all shops owned by this account.", inputSchema: {} },
    async () => textResult(JSON.stringify(await zuria.listZuriaShops(ctx.userId)))
  );

  server.registerTool(
    "zuria_create_billboard",
    { title: "Create Zuria Billboard", description: "Add a billboard to a shop.", inputSchema: { shopId: z.string(), label: z.string(), imageUrl: z.string() } },
    async ({ shopId, label, imageUrl }) => textResult(JSON.stringify(await zuria.createZuriaBillboard(ctx.userId, shopId, label, imageUrl)))
  );
  server.registerTool(
    "zuria_list_billboards",
    { title: "List Zuria Billboards", description: "List billboards in a shop.", inputSchema: { shopId: z.string() } },
    async ({ shopId }) => textResult(JSON.stringify(await zuria.listZuriaBillboards(ctx.userId, shopId)))
  );

  server.registerTool(
    "zuria_create_category",
    { title: "Create Zuria Category", description: "Add a product category to a shop (requires an existing billboard).", inputSchema: { shopId: z.string(), name: z.string(), billboardId: z.string() } },
    async ({ shopId, name, billboardId }) => textResult(JSON.stringify(await zuria.createZuriaCategory(ctx.userId, shopId, name, billboardId)))
  );
  server.registerTool(
    "zuria_list_categories",
    { title: "List Zuria Categories", description: "List product categories in a shop.", inputSchema: { shopId: z.string() } },
    async ({ shopId }) => textResult(JSON.stringify(await zuria.listZuriaCategories(ctx.userId, shopId)))
  );

  server.registerTool(
    "zuria_create_color",
    { title: "Create Zuria Color", description: "Add a product color option to a shop.", inputSchema: { shopId: z.string(), name: z.string(), value: z.string().describe("Hex code, e.g. #FF0000") } },
    async ({ shopId, name, value }) => textResult(JSON.stringify(await zuria.createZuriaColor(ctx.userId, shopId, name, value)))
  );
  server.registerTool(
    "zuria_list_colors",
    { title: "List Zuria Colors", description: "List product color options in a shop.", inputSchema: { shopId: z.string() } },
    async ({ shopId }) => textResult(JSON.stringify(await zuria.listZuriaColors(ctx.userId, shopId)))
  );

  server.registerTool(
    "zuria_create_size",
    { title: "Create Zuria Size", description: "Add a product size option to a shop.", inputSchema: { shopId: z.string(), name: z.string(), value: z.string() } },
    async ({ shopId, name, value }) => textResult(JSON.stringify(await zuria.createZuriaSize(ctx.userId, shopId, name, value)))
  );
  server.registerTool(
    "zuria_list_sizes",
    { title: "List Zuria Sizes", description: "List product size options in a shop.", inputSchema: { shopId: z.string() } },
    async ({ shopId }) => textResult(JSON.stringify(await zuria.listZuriaSizes(ctx.userId, shopId)))
  );

  server.registerTool(
    "zuria_create_product",
    {
      title: "Create Zuria Product",
      description: "Create a product listing. Requires an existing category, color, and size — list them first if their IDs aren't known.",
      inputSchema: {
        shopId: z.string(),
        name: z.string(),
        price: z.number(),
        categoryId: z.string(),
        colorId: z.string(),
        sizeId: z.string(),
        images: z.array(z.object({ url: z.string() })),
        isFeatured: z.boolean().optional(),
        isArchived: z.boolean().optional(),
      },
    },
    async ({ shopId, ...params }) => textResult(JSON.stringify(await zuria.createZuriaProduct(ctx.userId, shopId, params)))
  );
  server.registerTool(
    "zuria_list_products",
    { title: "List Zuria Products", description: "List products in a shop.", inputSchema: { shopId: z.string() } },
    async ({ shopId }) => textResult(JSON.stringify(await zuria.listZuriaProducts(ctx.userId, shopId)))
  );
}