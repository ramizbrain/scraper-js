import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
} from "playwright";
import { BROWSER_CONFIG } from "../config";

export class BrowserInstance {
  browser: Browser;
  contexts: Set<BrowserContext> = new Set();
  activeTabs: number = 0;
  idleSince: number = Date.now();
  type: string;

  constructor(browser: Browser, type: string) {
    this.browser = browser;
    this.type = type;
  }

  async newContext(): Promise<BrowserContext> {
    const context = await this.browser.newContext();
    this.contexts.add(context);
    return context;
  }

  async newPage(): Promise<Page> {
    const context = await this.newContext();
    const page = await context.newPage();
    this.activeTabs++;
    page.on("close", () => {
      this.activeTabs--;
      this.contexts.delete(context);
      this.idleSince = Date.now();
    });
    return page;
  }

  get idleTime() {
    return Date.now() - this.idleSince;
  }

  async close() {
    for (const context of this.contexts) {
      await context.close();
    }
    await this.browser.close();
  }

  static async launch(type: string = BROWSER_CONFIG.BROWSER_TYPE) {
    let browser: Browser;
    try {
      console.log(
        "[BROWSER_INSTANCE] Launching browser of type:",
        type,
        "HEADLESS:",
        BROWSER_CONFIG.HEADLESS
      );
      if (type === "chromium")
        browser = await chromium.launch({ headless: BROWSER_CONFIG.HEADLESS });
      else if (type === "firefox")
        browser = await firefox.launch({ headless: BROWSER_CONFIG.HEADLESS });
      else browser = await webkit.launch({ headless: BROWSER_CONFIG.HEADLESS });
      if (!browser) {
        console.error(
          "[BROWSER_INSTANCE] Failed to launch browser, got:",
          browser
        );
        return undefined;
      }
      console.log("[BROWSER_INSTANCE] Browser launched successfully");
      return new BrowserInstance(browser, type);
    } catch (err) {
      console.error("[BROWSER_INSTANCE] Error launching browser:", err);
      return undefined;
    }
  }
}
