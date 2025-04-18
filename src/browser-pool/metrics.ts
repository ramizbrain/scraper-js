export interface PoolMetrics {
  activeBrowsers: number;
  activeTabs: number;
  queueSize: number;
  avgWaitTime: number;
  failedPages: number;
}

export class Metrics {
  private metrics: PoolMetrics = {
    activeBrowsers: 0,
    activeTabs: 0,
    queueSize: 0,
    avgWaitTime: 0,
    failedPages: 0,
  };
  private waitTimes: number[] = [];

  setActiveBrowsers(count: number) {
    this.metrics.activeBrowsers = count;
  }
  setActiveTabs(count: number) {
    this.metrics.activeTabs = count;
  }
  setQueueSize(count: number) {
    this.metrics.queueSize = count;
  }
  addWaitTime(ms: number) {
    this.waitTimes.push(ms);
    if (this.waitTimes.length > 100) this.waitTimes.shift();
    this.metrics.avgWaitTime = this.waitTimes.length
      ? Math.round(
          this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length
        )
      : 0;
  }
  incFailedPages() {
    this.metrics.failedPages++;
  }
  getMetrics(): PoolMetrics {
    return { ...this.metrics };
  }
}
