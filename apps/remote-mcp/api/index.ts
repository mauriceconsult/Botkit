// The built JavaScript module does not ship a declaration file.
// @ts-expect-error No declaration file is available for the runtime build.
import app from "../dist/index.js";
export default (req: Request) => app.fetch(req);
