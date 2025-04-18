export class RequestQueue<T> {
  private queue: Array<{
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
  }> = [];
  private size = 0;

  enqueue(): Promise<T> {
    this.size++;
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  dequeue(value: T) {
    const item = this.queue.shift();
    if (item) {
      this.size--;
      item.resolve(value);
    }
  }

  rejectAll(reason?: any) {
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) item.reject(reason);
    }
    this.size = 0;
  }

  get length() {
    return this.queue.length;
  }
}
