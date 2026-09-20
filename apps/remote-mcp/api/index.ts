// api/index.ts
import { handle } from "hono/vercel";
// The bundled JavaScript entrypoint does not ship TypeScript declarations.
// @ts-expect-error -- `dist/index.js` is the runtime entrypoint.
import app from "../dist/index.js";

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
