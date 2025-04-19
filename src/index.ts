import { Elysia } from "elysia";
import scrapeRoute from "./routes/scrape";

import { BrowserPool } from "./browser-pool/pool-manager";

const pool = new BrowserPool();

const api = new Elysia({ prefix: "/api" }).use(scrapeRoute(pool));

const app = new Elysia()
  .use(api)
  .get("/", () => "Hello Elysia")
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
