import { BrowserPool } from "../browser-pool/pool-manager";
import { BROWSER_CONFIG } from "../config";
import HTMLCleaner from "../utils/html-cleaner";
import TurndownService from "turndown";

function isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (
      /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01]))/.test(
        parsed.hostname
      )
    )
      return false;
    return true;
  } catch {
    return false;
  }
}

export async function scrapeHandler(pool: BrowserPool, body: any, set: any) {
  if (!body?.url || typeof body.url !== "string" || !isValidUrl(body.url)) {
    set.status = 400;
    return { html: "", status: 400, success: false, error: "Invalid URL" };
  }
  let browser;
  let page;
  try {
    browser = await pool.acquire();
  } catch (e) {
    console.error("[SCRAPE] Gagal acquire browser:", e);
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
    console.log("[SCRAPE] Membuka halaman:", body.url);
    try {
      await page.goto(body.url, {
        timeout: BROWSER_CONFIG.PAGE_NAVIGATION_TIMEOUT_MS,
      });
      console.log("[SCRAPE] Sukses load halaman:", body.url);
    } catch (gotoErr) {
      console.error("[SCRAPE] Gagal load halaman:", body.url, gotoErr);
      throw gotoErr;
    }
    const html = await page.content();
    await page.close();
    const cleanerHtml = HTMLCleaner.clean(html);
    const markdown = new TurndownService().turndown(cleanerHtml);
    set.status = 200;
    return { html: markdown, status: 200, success: true };
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
      error: "Internal server error: " + (e?.message || e),
    };
  } finally {
    if (browser) pool.release(browser);
  }
}
