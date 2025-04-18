import { t, Elysia } from "elysia";

export default function healthRoute() {
  return new Elysia().get(
    "/api/scrape/health",
    () => ({ status: "ok", timestamp: Date.now() }),
    {
      response: t.Object({ status: t.String(), timestamp: t.Number() }),
    }
  );
}
