import { t, Elysia } from "elysia";
import { BrowserPool } from "../browser-pool/pool-manager";
import { BROWSER_CONFIG } from "../config";

function isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    // Block internal IPs (simple check)
    if (
      /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01]))/.test(
        parsed.hostname
      )
    )
      return false;
    // Optional: whitelist/blacklist domain logic here
    return true;
  } catch {
    return false;
  }
}

export default function scrapeRoute(pool: BrowserPool) {
  return new Elysia().post(
    "/api/scrape",
    async ({ body, set }) => {
      if (!body?.url || typeof body.url !== "string" || !isValidUrl(body.url)) {
        set.status = 400;
        return { html: "", status: 400, success: false, error: "Invalid URL" };
      }
      let browser;
      let page;
      try {
        browser = await pool.acquire();
      } catch (e) {
        set.status = 429;
        return {
          html: "",
          status: 429,
          success: false,
          error: "Browser pool full",
        };
      }
      try {
        page = await browser.newPage();
        await page.goto(body.url, {
          timeout: BROWSER_CONFIG.PAGE_NAVIGATION_TIMEOUT_MS,
        });
        const html = await page.content();
        await page.close();
        set.status = 200;
        return { html, status: 200, success: true };
      } catch (e: any) {
        if (e.name === "TimeoutError") {
          set.status = 504;
          return {
            html: "",
            status: 504,
            success: false,
            error: "Navigation timeout",
          };
        }
        set.status = 500;
        return {
          html: "",
          status: 500,
          success: false,
          error: "Internal server error",
        };
      } finally {
        if (browser) pool.release(browser);
      }
    },
    {
      body: t.Object({ url: t.String() }),
      response: t.Object({
        html: t.String(),
        status: t.Number(),
        success: t.Boolean(),
        error: t.Optional(t.String()),
      }),
    }
  );
}
