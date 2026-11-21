export interface CacheOptions {
  messages?: number | CacheConfig;
  users?: number | CacheConfig;
  guilds?: number | CacheConfig;
  channels?: number | CacheConfig;
}

export interface CacheConfig {
  max?: number;
  ttl?: number;
  dispose?: (key: string, value: any) => void;
}

export class CacheEntry<T> {
  value: T;
  timestamp: number;

  constructor(value: T) {
    this.value = value;
    this.timestamp = Date.now();
  }

  isExpired(ttl: number): boolean {
    if (ttl <= 0) return false;
    return Date.now() - this.timestamp > ttl;
  }
}
