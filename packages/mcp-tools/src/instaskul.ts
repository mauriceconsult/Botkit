// packages/mcp-tools/src/instaskul.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as instaskul from "../../core/src/clients/instaskul";
import { ToolContext } from "./types";

export function registerInstaskulTools(server: McpServer, ctx: ToolContext) {
  server.registerTool(
    "instaskul_create_coursework",
    {
      title: "Create Instaskul Coursework",
      description: "Add coursework to a course.",
      inputSchema: { courseId: z.string(), title: z.string() },
    },
    async ({ courseId, title }) => {
      const result = await instaskul.createInstaskulCoursework(
        ctx.userId,
        courseId,
        title,
      );
      return {
        content: [
          { type: "text" as const, text: `Created (id: ${result.id})` },
        ],
      };
    },
  );
  server.registerTool(
    "instaskul_list_coursework",
    {
      title: "List Instaskul Coursework",
      description: "List coursework in a course.",
      inputSchema: { courseId: z.string() },
    },
    async ({ courseId }) => {
      const results = await instaskul.listInstaskulCoursework(
        ctx.userId,
        courseId,
      );
      return {
        content: [{ type: "text" as const, text: JSON.stringify(results) }],
      };
    },
  );
  // same pair-shape for: course, coursenoticeboard, tutorial (+ assignment nested), noticeboard
}
