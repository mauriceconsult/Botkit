import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as dukaboda from "@botkit/core/clients/dukaboda.js";
import type { ToolContext } from "./types.js";

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function registerDukabodaTools(server: McpServer, ctx: ToolContext) {
  server.registerTool(
    "dukaboda_register_rider",
    {
      title: "Register as Dukaboda Rider",
      description: "Register the connected account as a delivery rider.",
      inputSchema: {
        name: z.string(),
        phone: z.string(),
        vehicleType: z.string(),
        email: z.string().optional(),
      },
    },
    async ({ name, phone, vehicleType, email }) =>
      textResult(
        JSON.stringify(
          await dukaboda.registerDukabodaRider(
            ctx.userId,
            name,
            phone,
            vehicleType,
            email,
          ),
        ),
      ),
  );
  server.registerTool(
    "dukaboda_get_rider_profile",
    {
      title: "Get Dukaboda Rider Profile",
      description: "Get this account's own rider profile.",
      inputSchema: {},
    },
    async () =>
      textResult(
        JSON.stringify(await dukaboda.getDukabodaRiderProfile(ctx.userId)),
      ),
  );
  server.registerTool(
    "dukaboda_set_rider_active",
    {
      title: "Set Dukaboda Rider Active Status",
      description: "Toggle whether this rider is accepting jobs.",
      inputSchema: { isActive: z.boolean() },
    },
    async ({ isActive }) =>
      textResult(
        JSON.stringify(
          await dukaboda.setDukabodaRiderActive(ctx.userId, isActive),
        ),
      ),
  );

  server.registerTool(
    "dukaboda_list_available_jobs",
    {
      title: "List Available Dukaboda Jobs",
      description: "List delivery jobs available to accept (default: pending).",
      inputSchema: { status: z.string().optional() },
    },
    async ({ status }) =>
      textResult(
        JSON.stringify(
          await dukaboda.listDukabodaAvailableJobs(ctx.userId, status),
        ),
      ),
  );
  server.registerTool(
    "dukaboda_list_my_jobs",
    {
      title: "List My Dukaboda Jobs",
      description: "List delivery jobs assigned to this rider.",
      inputSchema: { status: z.string().optional() },
    },
    async ({ status }) =>
      textResult(
        JSON.stringify(await dukaboda.listDukabodaMyJobs(ctx.userId, status)),
      ),
  );
  server.registerTool(
    "dukaboda_accept_job",
    {
      title: "Accept Dukaboda Job",
      description: "Claim a pending delivery job for this rider.",
      inputSchema: { jobId: z.string() },
    },
    async ({ jobId }) =>
      textResult(
        JSON.stringify(await dukaboda.acceptDukabodaJob(ctx.userId, jobId)),
      ),
  );
  server.registerTool(
    "dukaboda_update_job_status",
    {
      title: "Update Dukaboda Job Status",
      description:
        "Advance a job's delivery status (e.g. picking_up, delivered).",
      inputSchema: {
        jobId: z.string(),
        status: z.string(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      },
    },
    async ({ jobId, status, lat, lng }) =>
      textResult(
        JSON.stringify(
          await dukaboda.updateDukabodaJobStatus(
            ctx.userId,
            jobId,
            status,
            lat,
            lng,
          ),
        ),
      ),
  );
}
