import { t, Elysia } from "elysia";
import { BrowserPool } from "../browser-pool/pool-manager";
import { scrapeHandler } from "../controller/scrapeController";

export default function scrapeRoute(pool: BrowserPool) {
  return new Elysia({ prefix: "/scrape" })

    .post("/", async ({ body, set }) => scrapeHandler(pool, body, set), {
      body: t.Object({ url: t.String() }),
      response: t.Object({
        html: t.String(),
        status: t.Number(),
        success: t.Boolean(),
        error: t.Optional(t.String()),
      }),
    })

    .get("/metrics", () => pool.getMetrics())

    .get("/health", () => ({ status: "ok", timestamp: Date.now() }), {
      response: t.Object({ status: t.String(), timestamp: t.Number() }),
    });
}
