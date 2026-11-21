export enum Priority {
  HIGH = 0,
  NORMAL = 1,
  LOW = 2
}

interface QueuedRequest {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: Priority;
  timestamp: number;
}

export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private rateLimit: { limit: number; remaining: number; reset: number } = {
    limit: 50,
    remaining: 50,
    reset: Date.now()
  };

  async add<T>(fn: () => Promise<T>, priority: Priority = Priority.NORMAL): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn,
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      });

      this.queue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.timestamp - b.timestamp;
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      await this.checkRateLimit();

      const request = this.queue.shift();
      if (!request) break;

      try {
        const result = await request.fn();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }

      this.rateLimit.remaining--;
    }

    this.processing = false;
  }

  private async checkRateLimit() {
    const now = Date.now();

    if (now >= this.rateLimit.reset) {
      this.rateLimit.remaining = this.rateLimit.limit;
      this.rateLimit.reset = now + 1000;
    }

    if (this.rateLimit.remaining <= 0) {
      const delay = this.rateLimit.reset - now;
      if (delay > 0) {
        await this.sleep(delay);
      }
    }
  }

  updateRateLimit(limit: number, remaining: number, reset: number) {
    this.rateLimit.limit = limit;
    this.rateLimit.remaining = remaining;
    this.rateLimit.reset = reset;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get size(): number {
    return this.queue.length;
  }

  clear() {
    for (const request of this.queue) {
      request.reject(new Error('Queue cleared'));
    }
    this.queue = [];
  }
}
