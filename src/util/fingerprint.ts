import { randomBytes } from 'crypto';

export interface ClientProperties {
  os: string;
  browser: string;
  device: string;
  system_locale: string;
  browser_user_agent: string;
  browser_version: string;
  os_version: string;
  referrer: string;
  referring_domain: string;
  referrer_current: string;
  referring_domain_current: string;
  release_channel: string;
  client_build_number: number;
  client_event_source: null;
}

export interface ExtendedClientProperties extends ClientProperties {
  client_version: string;
  window_manager?: string;
  distro?: string;
}

export class Fingerprint {
  private static sessionId: string | null = null;
  private static launchId: string | null = null;

  static generateSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = this.generateUUID();
    }
    return this.sessionId;
  }

  static generateLaunchId(): string {
    if (!this.launchId) {
      this.launchId = this.generateUUID();
    }
    return this.launchId;
  }

  private static generateUUID(): string {
    const bytes = randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = bytes.toString('hex');
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32)
    ].join('-');
  }

  static getProperties(): ClientProperties {
    return {
      os: 'Windows',
      browser: 'Chrome',
      device: '',
      system_locale: 'en-US',
      browser_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      browser_version: '131.0.0.0',
      os_version: '10',
      referrer: '',
      referring_domain: '',
      referrer_current: '',
      referring_domain_current: '',
      release_channel: 'stable',
      client_build_number: 345352,
      client_event_source: null
    };
  }

  static getSuperProperties(): string {
    const props = this.getProperties();
    return Buffer.from(JSON.stringify(props)).toString('base64');
  }

  static getExtendedProperties(): ExtendedClientProperties {
    return {
      ...this.getProperties(),
      client_version: '131.0.0.0'
    };
  }
}
