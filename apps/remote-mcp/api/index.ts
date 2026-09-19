import app from "../dist/index.js"; 
export default (req: Request) => app.fetch(req);
