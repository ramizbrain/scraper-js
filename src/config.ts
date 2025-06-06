import { env } from "bun";

export const BROWSER_CONFIG = {
  MAX_BROWSERS: Number(env.MAX_BROWSERS) || 5,
  MAX_TABS_PER_BROWSER: Number(env.MAX_TABS_PER_BROWSER) || 10,
  BROWSER_IDLE_TIMEOUT_MS: Number(env.BROWSER_IDLE_TIMEOUT_MS) || 30000,
  PAGE_NAVIGATION_TIMEOUT_MS: Number(env.PAGE_NAVIGATION_TIMEOUT_MS) || 15000,
  HEADLESS: true,
  BROWSER_TYPE: "chromium",
  POOL_SCAN_INTERVAL_MS: 5000,
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MINUTE: 100,
  },
};
