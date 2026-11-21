export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatusCodes?: number[];
  shouldRetry?: (error: any, attempt: number) => boolean;
}

export class RetryHandler {
  private maxRetries: number;
  private retryDelay: number;
  private retryableStatusCodes: Set<number>;
  private shouldRetry?: (error: any, attempt: number) => boolean;

  constructor(options: RetryOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.retryableStatusCodes = new Set(options.retryableStatusCodes ?? [500, 502, 503, 504]);
    this.shouldRetry = options.shouldRetry;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        if (attempt === this.maxRetries) {
          throw error;
        }

        const shouldRetry = this.shouldRetry 
          ? this.shouldRetry(error, attempt)
          : this.isRetryable(error);

        if (!shouldRetry) {
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private isRetryable(error: any): boolean {
    if (error.status && this.retryableStatusCodes.has(error.status)) {
      return true;
    }

    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }

    return false;
  }

  private calculateDelay(attempt: number): number {
    return this.retryDelay * Math.pow(2, attempt);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
