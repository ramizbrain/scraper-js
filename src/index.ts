import { Elysia } from "elysia";
import scrapeRoute from "./routes/scrape";
import healthRoute from "./routes/health";
import { BrowserPool } from "./browser-pool/pool-manager";

const pool = new BrowserPool();

const app = new Elysia()
  .use(scrapeRoute(pool))
  .use(healthRoute())
  .get("/", () => "Hello Elysia")
  .get("/api/scrape/metrics", () => pool.getMetrics())
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
