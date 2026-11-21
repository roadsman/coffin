export class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL: number;

  constructor(cacheTTL: number = 5000) {
    this.cacheTTL = cacheTTL;
  }

  async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const existing = this.pending.get(key);
    if (existing) {
      return existing;
    }

    const promise = fn()
      .then(result => {
        this.cache.set(key, { data: result, timestamp: Date.now() });
        this.pending.delete(key);
        return result;
      })
      .catch(error => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, promise);
    return promise;
  }

  clear() {
    this.pending.clear();
    this.cache.clear();
  }

  clearCache() {
    this.cache.clear();
  }

  clearPending() {
    this.pending.clear();
  }

  get pendingCount(): number {
    return this.pending.size;
  }

  get cacheSize(): number {
    return this.cache.size;
  }
}
