import { request, FormData } from 'undici';
import { EventEmitter } from 'events';
import { Bucket } from './bucket';
import { Routes } from './routes';
import { Fingerprint } from '../util/fingerprint';
import { DiscordAPIError, RateLimitError } from '../errors';
import { AttachmentBuilder } from '../builders/attachment';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  files?: AttachmentBuilder[];
  headers?: Record<string, string>;
  auth?: boolean;
  reason?: string;
}

export class RestManager extends EventEmitter {
  private buckets = new Map<string, Bucket>();
  private token: string;
  private baseUrl = 'https://discord.com/api/v10';
  private globalReset: number | null = null;
  private superProperties: string;
  private bucketCleanupInterval: NodeJS.Timeout;

  constructor(token: string) {
    super();
    this.token = token;
    this.superProperties = Fingerprint.getSuperProperties();
    
    this.bucketCleanupInterval = setInterval(() => {
      this.cleanupBuckets();
    }, 300000);
  }

  private cleanupBuckets() {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.reset !== -1 && now > bucket.reset + 60000) {
        this.buckets.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this.bucketCleanupInterval);
    this.buckets.clear();
    this.removeAllListeners();
  }

  async request(route: string, options: RequestOptions = {}): Promise<any> {
    const method = options.method || 'GET';
    const url = `${this.baseUrl}${route}`;
    
    const bucketId = this.getBucketId(route, method);
    let bucket = this.buckets.get(bucketId);
    
    if (!bucket) {
      bucket = new Bucket();
      this.buckets.set(bucketId, bucket);
    }

    await this.checkGlobalRateLimit();
    await bucket.wait();

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Origin': 'https://discord.com',
      'Referer': 'https://discord.com/channels/@me',
      'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'X-Debug-Options': 'bugReporterEnabled',
      'X-Discord-Locale': 'en-US',
      'X-Discord-Timezone': 'America/New_York',
      'X-Super-Properties': this.superProperties,
      ...options.headers
    };

    if (options.body && method !== 'GET' && method !== 'DELETE') {
      headers['Content-Type'] = 'application/json';
    }

    if (options.auth !== false) {
      headers['Authorization'] = this.token;
    }

    if (options.reason) {
      headers['X-Audit-Log-Reason'] = encodeURIComponent(options.reason);
    }

    const requestOptions: any = {
      method,
      headers,
      bodyTimeout: 15000,
      headersTimeout: 15000
    };

    if (options.files && options.files.length > 0) {
      const form = new FormData();
      
      for (let i = 0; i < options.files.length; i++) {
        const file = options.files[i];
        form.append(`files[${i}]`, file.data, file.filename);
      }
      
      if (options.body) {
        const attachments = options.files.map((file, index) => file.toJSON(index));
        const payload = {
          ...options.body,
          attachments
        };
        form.append('payload_json', JSON.stringify(payload));
      }

      requestOptions.body = form;
      delete headers['Content-Type'];
    } else if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }

    let response;
    
    try {
      response = await request(url, {
        ...requestOptions,
        autoSelectFamily: true
      });
    } catch (error: any) {
      throw new Error(`Request failed: ${error.message}`);
    }
    
    this.handleRateLimit(bucket, response.headers);

    let body: string = '';
    
    try {
      body = await response.body.text();
    } catch (err) {
      this.emit('debug', `Failed to read body: ${err}`);
    }

    let data: any;

    try {
      data = body ? JSON.parse(body) : null;
    } catch {
      this.emit('debug', `Failed to parse JSON, body length: ${body.length}`);
      data = body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }

    if (response.statusCode === 429) {
      const retryAfter = (data.retry_after ?? 1) * 1000;
      
      if (data.global) {
        this.globalReset = Date.now() + retryAfter;
      }

      await this.sleep(retryAfter + 100);
      return this.request(route, options);
    }

    const error = new Error(`HTTP ${response.statusCode}: ${data?.message || JSON.stringify(data)}`);
    (error as any).code = data?.code;
    (error as any).status = response.statusCode;
    throw error;
  }

  private handleRateLimit(bucket: Bucket, headers: any) {
    const limit = headers['x-ratelimit-limit'];
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];
    const resetAfter = headers['x-ratelimit-reset-after'];

    if (limit !== undefined) bucket.limit = parseInt(limit);
    if (remaining !== undefined) bucket.remaining = parseInt(remaining);
    if (reset !== undefined) bucket.reset = parseFloat(reset) * 1000;
    if (resetAfter !== undefined) bucket.resetAfter = parseFloat(resetAfter) * 1000;
  }

  private async checkGlobalRateLimit() {
    if (this.globalReset && Date.now() < this.globalReset) {
      const wait = this.globalReset - Date.now();
      await this.sleep(wait);
      this.globalReset = null;
    }
  }

  private getBucketId(route: string, method: string): string {
    let normalized = route.split('?')[0];
    
    const parts = normalized.split('/').filter(p => p);
    
    normalized = parts.map((part, i) => {
      if (/^\d{17,20}$/.test(part)) {
        const prev = parts[i - 1];
        if (prev === 'channels' || prev === 'guilds' || prev === 'webhooks') {
          return ':id';
        }
        if (prev === 'messages' && i >= 2 && parts[i - 2] === 'channels') {
          return ':id';
        }
        return part;
      }
      return part;
    }).join('/');

    return `${method}:/${normalized}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get(route: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request(route, { ...options, method: 'GET' });
  }

  post(route: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request(route, { ...options, method: 'POST' });
  }

  put(route: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request(route, { ...options, method: 'PUT' });
  }

  patch(route: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request(route, { ...options, method: 'PATCH' });
  }

  delete(route: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request(route, { ...options, method: 'DELETE' });
  }
}
