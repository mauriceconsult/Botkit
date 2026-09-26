import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as instaskul from "@botkit/core/clients/instaskul.js";
import type { ToolContext } from "./types.js";

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function registerInstaskulTools(server: McpServer, ctx: ToolContext) {
  server.registerTool(
    "instaskul_create_course",
    {
      title: "Create Instaskul Course",
      description: "Add a new course.",
      inputSchema: { title: z.string() },
    },
    async ({ title }) => {
      const result = await instaskul.createInstaskulCourse(ctx.userId, title);
      return textResult(`Created (id: ${result.id})`);
    },
  );

  server.registerTool(
    "instaskul_list_courses",
    {
      title: "List Instaskul Courses",
      description: "List all courses.",
      inputSchema: {},
    },
    async () =>
      textResult(
        JSON.stringify(await instaskul.listInstaskulCourses(ctx.userId)),
      ),
  );

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
      return textResult(`Created (id: ${result.id})`);
    },
  );

  server.registerTool(
    "instaskul_list_coursework",
    {
      title: "List Instaskul Coursework",
      description: "List coursework in a course.",
      inputSchema: { courseId: z.string() },
    },
    async ({ courseId }) =>
      textResult(
        JSON.stringify(
          await instaskul.listInstaskulCoursework(ctx.userId, courseId),
        ),
      ),
  );

  // instaskul_create_coursenoticeboard / instaskul_list_coursenoticeboards — same courseId-scoped shape as coursework
  // instaskul_create_tutorial / instaskul_list_tutorials — same courseId-scoped shape
  // instaskul_create_assignment / instaskul_list_assignments — courseId + tutorialId scoped
  // instaskul_create_noticeboard / instaskul_list_noticeboards — same as course, no parent id
}
