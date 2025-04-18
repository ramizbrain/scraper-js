import { BrowserInstance } from "./browser-instance";
import { BROWSER_CONFIG } from "../config";
import { RequestQueue } from "./queue";
import { Metrics } from "./metrics";

export class BrowserPool {
  private browsers: BrowserInstance[] = [];
  private queue = new RequestQueue<BrowserInstance>();
  private metrics = new Metrics();
  private launching = 0;

  constructor() {
    this.monitorPool();
  }

  async acquire(): Promise<BrowserInstance> {
    console.log(
      "[POOL] browsers:",
      this.browsers.length,
      "launching:",
      this.launching,
      "queue:",
      this.queue.length
    );
    // Cari browser dengan slot tab tersedia
    let browser = this.browsers.find(
      (b) => b.activeTabs < BROWSER_CONFIG.MAX_TABS_PER_BROWSER
    );
    if (browser) {
      this.metrics.setActiveTabs(this.getActiveTabs());
      console.log("[POOL] Reusing browser, activeTabs:", browser.activeTabs);
      return browser;
    }
    // Jika pool belum penuh, buat browser baru
    if (this.browsers.length + this.launching < BROWSER_CONFIG.MAX_BROWSERS) {
      this.launching++;
      console.log("[POOL] Launching new browser...");
      try {
        browser = await BrowserInstance.launch(BROWSER_CONFIG.BROWSER_TYPE);
        if (!browser) {
          console.error(
            "[POOL] BrowserInstance.launch returned undefined or null!"
          );
        } else {
          this.browsers.push(browser);
        }
      } catch (err) {
        console.error("[POOL] Error launching browser:", err);
      }
      this.launching--;
      this.metrics.setActiveBrowsers(this.browsers.length);
      this.metrics.setActiveTabs(this.getActiveTabs());
      if (!browser) {
        throw new Error(
          "Gagal meluncurkan browser. Pastikan Playwright terinstal dan dependencies browser tersedia."
        );
      }
      console.log("[POOL] Browser launched, total:", this.browsers.length);
      return browser;
    }
    // Jika penuh, antre
    this.metrics.setQueueSize(this.queue.length + 1);
    console.log(
      "[POOL] Pool full, enqueueing request. Queue size:",
      this.queue.length + 1
    );
    const start = Date.now();
    const b = await this.queue.enqueue();
    this.metrics.addWaitTime(Date.now() - start);
    this.metrics.setActiveTabs(this.getActiveTabs());
    return b;
  }

  release(browser: BrowserInstance) {
    // Jika ada antrean, berikan browser ke request berikutnya
    if (this.queue.length > 0) {
      this.queue.dequeue(browser);
      this.metrics.setQueueSize(this.queue.length);
    }
    // Update idle time
    browser.idleSince = Date.now();
    this.metrics.setActiveTabs(this.getActiveTabs());
  }

  getActiveTabs() {
    return this.browsers.reduce((sum, b) => sum + b.activeTabs, 0);
  }

  async monitorPool() {
    setInterval(async () => {
      for (const browser of [...this.browsers]) {
        if (
          browser.activeTabs === 0 &&
          browser.idleTime > BROWSER_CONFIG.BROWSER_IDLE_TIMEOUT_MS
        ) {
          await browser.close();
          this.browsers = this.browsers.filter((b) => b !== browser);
          this.metrics.setActiveBrowsers(this.browsers.length);
        }
      }
    }, BROWSER_CONFIG.POOL_SCAN_INTERVAL_MS);
  }

  getMetrics() {
    return this.metrics.getMetrics();
  }

  async shutdown() {
    for (const browser of this.browsers) {
      await browser.close();
    }
    this.browsers = [];
    this.queue.rejectAll("Shutdown");
  }
}
