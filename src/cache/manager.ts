import { User } from '../structures/user';
import { Guild } from '../structures/guild';
import { Channel } from '../structures/channel';
import { Message } from '../structures/message';
import { CacheOptions, CacheConfig, CacheEntry } from './options';

export class CacheManager {
  private users = new Map<string, CacheEntry<User>>();
  private guilds = new Map<string, CacheEntry<Guild>>();
  private channels = new Map<string, CacheEntry<Channel>>();
  private messages = new Map<string, CacheEntry<Message>>();
  
  private userConfig: CacheConfig;
  private guildConfig: CacheConfig;
  private channelConfig: CacheConfig;
  private messageConfig: CacheConfig;

  constructor(options: CacheOptions = {}) {
    this.userConfig = this.parseConfig(options.users ?? { max: 1000, ttl: 0 });
    this.guildConfig = this.parseConfig(options.guilds ?? { max: 100, ttl: 0 });
    this.channelConfig = this.parseConfig(options.channels ?? { max: 500, ttl: 0 });
    this.messageConfig = this.parseConfig(options.messages ?? { max: 100, ttl: 300000 });
  }

  private parseConfig(config: number | CacheConfig): CacheConfig {
    if (typeof config === 'number') {
      return { max: config, ttl: 0 };
    }
    return {
      max: config.max ?? 100,
      ttl: config.ttl ?? 0,
      dispose: config.dispose
    };
  }

  setUser(id: string, user: User): void {
    this.set(this.users, id, user, this.userConfig);
  }

  getUser(id: string): User | undefined {
    return this.get(this.users, id, this.userConfig);
  }

  setGuild(id: string, guild: Guild): void {
    this.set(this.guilds, id, guild, this.guildConfig);
  }

  getGuild(id: string): Guild | undefined {
    return this.get(this.guilds, id, this.guildConfig);
  }

  setChannel(id: string, channel: Channel): void {
    this.set(this.channels, id, channel, this.channelConfig);
  }

  getChannel(id: string): Channel | undefined {
    return this.get(this.channels, id, this.channelConfig);
  }

  setMessage(id: string, message: Message): void {
    this.set(this.messages, id, message, this.messageConfig);
  }

  getMessage(id: string): Message | undefined {
    return this.get(this.messages, id, this.messageConfig);
  }

  private set<T>(map: Map<string, CacheEntry<T>>, key: string, value: T, config: CacheConfig): void {
    if (config.max && config.max <= 0) return;

    map.set(key, new CacheEntry(value));

    if (config.max && map.size > config.max) {
      const firstKey = map.keys().next().value;
      if (firstKey) {
        const entry = map.get(firstKey);
        if (entry && config.dispose) {
          config.dispose(firstKey, entry.value);
        }
        map.delete(firstKey);
      }
    }
  }

  private get<T>(map: Map<string, CacheEntry<T>>, key: string, config: CacheConfig): T | undefined {
    const entry = map.get(key);
    
    if (!entry) {
      return undefined;
    }

    if (config.ttl && entry.isExpired(config.ttl)) {
      if (config.dispose) {
        config.dispose(key, entry.value);
      }
      map.delete(key);
      return undefined;
    }

    return entry.value;
  }

  sweep(): void {
    this.sweepMap(this.users, this.userConfig);
    this.sweepMap(this.guilds, this.guildConfig);
    this.sweepMap(this.channels, this.channelConfig);
    this.sweepMap(this.messages, this.messageConfig);
  }

  private sweepMap<T>(map: Map<string, CacheEntry<T>>, config: CacheConfig): void {
    if (!config.ttl || config.ttl <= 0) return;

    for (const [key, entry] of map.entries()) {
      if (entry.isExpired(config.ttl)) {
        if (config.dispose) {
          config.dispose(key, entry.value);
        }
        map.delete(key);
      }
    }
  }

  clear(): void {
    this.users.clear();
    this.guilds.clear();
    this.channels.clear();
    this.messages.clear();
  }

  get stats() {
    return {
      users: this.users.size,
      guilds: this.guilds.size,
      channels: this.channels.size,
      messages: this.messages.size
    };
  }
}
