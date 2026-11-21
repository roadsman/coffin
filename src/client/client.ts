import { EventEmitter } from 'events';
import { Connection } from '../gateway/connection';
import { RestManager } from '../rest/manager';
import { Routes } from '../rest/routes';
import { CacheManager } from '../cache/manager';
import { CacheOptions } from '../cache/options';
import { PresenceManager } from '../managers/presence';
import { Message, MessageData } from '../structures/message';
import { User, UserData } from '../structures/user';
import { Channel, ChannelData } from '../structures/channel';
import { Guild, GuildData } from '../structures/guild';
import { PresenceUpdate } from '../types/discord/presence';
import { AttachmentBuilder } from '../builders/attachment';

export interface ClientOptions {
  token: string;
  intents?: number;
  ws?: {
    properties?: any;
    capabilities?: number;
    compress?: boolean;
  };
  cache?: CacheOptions;
}

export class Client extends EventEmitter {
  private connection: Connection;
  rest: RestManager;
  cache: CacheManager;
  presence: PresenceManager;
  private token: string;
  private ready: boolean = false;
  private sweepInterval: NodeJS.Timeout | null = null;
  user: User | null = null;

  constructor(options: ClientOptions) {
    super();
    
    this.token = options.token;
    this.rest = new RestManager(options.token);
    this.cache = new CacheManager(options.cache);
    this.presence = new PresenceManager(this);
    
    this.connection = new Connection({
      token: options.token,
      intents: options.intents ?? 0,
      properties: options.ws?.properties,
      capabilities: options.ws?.capabilities,
      compress: options.ws?.compress ?? false
    });

    this.setupEvents();
    
    this.sweepInterval = setInterval(() => {
      this.cache.sweep();
    }, 60000);
  }

  private setupEvents() {
    this.connection.on('ready', (data) => {
      this.ready = true;
      this.user = new User(this, data.user);
      this.emit('ready', data);
    });

    this.connection.on('dispatch', (event, data) => {
      this.emit('raw', event, data);
      this.handleEvent(event, data);
    });

    this.connection.on('debug', (message) => {
      this.emit('debug', message);
    });

    this.connection.on('error', (error) => {
      this.emit('error', error);
    });

    this.connection.on('close', (code, reason) => {
      this.ready = false;
      this.emit('disconnect', code, reason);
    });
  }

  private handleEvent(event: string, data: any) {
    switch (event) {
      case 'MESSAGE_CREATE':
        if (data && data.id && data.channel_id) {
          const message = new Message(this, data as MessageData);
          this.cache.setMessage(message.id, message);
          this.cache.setUser(message.author.id, message.author);
          this.emit('messageCreate', message);
        }
        break;
      case 'MESSAGE_UPDATE':
        if (data && data.id && data.channel_id) {
          const message = new Message(this, data as MessageData);
          this.cache.setMessage(message.id, message);
          this.emit('messageUpdate', message);
        }
        break;
      case 'MESSAGE_DELETE':
        this.emit('messageDelete', data);
        break;
      case 'GUILD_CREATE':
        const guild = new Guild(this, data as GuildData);
        this.cache.setGuild(guild.id, guild);
        this.emit('guildCreate', guild);
        break;
      case 'GUILD_DELETE':
        this.emit('guildDelete', data);
        break;
      case 'CHANNEL_CREATE':
        const channelCreate = new Channel(this, data as ChannelData);
        this.cache.setChannel(channelCreate.id, channelCreate);
        this.emit('channelCreate', channelCreate);
        break;
      case 'CHANNEL_UPDATE':
        const channelUpdate = new Channel(this, data as ChannelData);
        this.cache.setChannel(channelUpdate.id, channelUpdate);
        this.emit('channelUpdate', channelUpdate);
        break;
      case 'CHANNEL_DELETE':
        this.emit('channelDelete', new Channel(this, data as ChannelData));
        break;
      case 'TYPING_START':
        this.emit('typingStart', data);
        break;
      case 'PRESENCE_UPDATE':
        this.emit('presenceUpdate', data);
        break;
      case 'USER_UPDATE':
        const user = new User(this, data as UserData);
        this.cache.setUser(user.id, user);
        this.emit('userUpdate', user);
        break;
      case 'RELATIONSHIP_ADD':
        this.emit('relationshipAdd', data);
        break;
      case 'RELATIONSHIP_REMOVE':
        this.emit('relationshipRemove', data);
        break;
    }
  }

  connect() {
    this.connection.connect();
  }

  disconnect() {
    this.connection.disconnect();
    
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    
    this.ready = false;
  }

  destroy() {
    this.disconnect();
    this.rest.destroy();
    this.cache.clear();
    this.removeAllListeners();
  }

  async sendMessage(channelId: string, content: string | { content?: string; embeds?: any[]; components?: any[]; files?: AttachmentBuilder[]; [key: string]: any }) {
    const body = typeof content === 'string' ? { content } : content;
    const files = typeof content === 'object' ? content.files : undefined;
    
    if (files) {
      delete body.files;
    }
    
    return this.rest.post(Routes.channelMessages(channelId), { body, files });
  }

  async editMessage(channelId: string, messageId: string, content: string | { content?: string; embeds?: any[]; [key: string]: any }) {
    const body = typeof content === 'string' ? { content } : content;
    return this.rest.patch(Routes.channelMessage(channelId, messageId), { body });
  }

  async deleteMessage(channelId: string, messageId: string) {
    return this.rest.delete(Routes.channelMessage(channelId, messageId));
  }

  async fetchMessage(channelId: string, messageId: string) {
    return this.rest.get(Routes.channelMessage(channelId, messageId));
  }

  async fetchMessages(channelId: string, options?: { limit?: number; before?: string; after?: string }) {
    const query = new URLSearchParams();
    if (options?.limit) query.set('limit', options.limit.toString());
    if (options?.before) query.set('before', options.before);
    if (options?.after) query.set('after', options.after);
    
    const queryString = query.toString();
    const route = queryString ? `${Routes.channelMessages(channelId)}?${queryString}` : Routes.channelMessages(channelId);
    
    return this.rest.get(route);
  }

  async addReaction(channelId: string, messageId: string, emoji: string) {
    return this.rest.put(Routes.reaction(channelId, messageId, emoji));
  }

  async removeReaction(channelId: string, messageId: string, emoji: string, userId: string = '@me') {
    return this.rest.delete(Routes.reaction(channelId, messageId, emoji, userId));
  }

  async typing(channelId: string) {
    return this.rest.post(Routes.typing(channelId));
  }

  async fetchChannel(channelId: string) {
    return this.rest.get(Routes.channel(channelId));
  }

  async fetchGuild(guildId: string) {
    return this.rest.get(Routes.guild(guildId));
  }

  async fetchUser(userId: string = '@me') {
    return this.rest.get(Routes.user(userId));
  }

  async createDM(userId: string) {
    return this.rest.post(Routes.userChannels(), {
      body: { recipient_id: userId }
    });
  }

  async fetchGuildMember(guildId: string, userId: string) {
    return this.rest.get(Routes.guildMember(guildId, userId));
  }

  async kickMember(guildId: string, userId: string, reason?: string) {
    return this.rest.delete(Routes.guildMember(guildId, userId), { reason });
  }

  async banMember(guildId: string, userId: string, options?: { deleteMessageDays?: number; reason?: string }) {
    const body: any = {};
    if (options?.deleteMessageDays) {
      body.delete_message_days = options.deleteMessageDays;
    }
    return this.rest.put(Routes.guildBan(guildId, userId), { 
      body, 
      reason: options?.reason 
    });
  }

  async unbanMember(guildId: string, userId: string, reason?: string) {
    return this.rest.delete(Routes.guildBan(guildId, userId), { reason });
  }

  async timeoutMember(guildId: string, userId: string, until: Date, reason?: string) {
    return this.rest.patch(Routes.guildMember(guildId, userId), {
      body: { communication_disabled_until: until.toISOString() },
      reason
    });
  }

  async removeTimeout(guildId: string, userId: string, reason?: string) {
    return this.rest.patch(Routes.guildMember(guildId, userId), {
      body: { communication_disabled_until: null },
      reason
    });
  }

  async createWebhook(channelId: string, name: string, avatar?: string) {
    return this.rest.post(Routes.channelWebhooks(channelId), {
      body: { name, avatar }
    });
  }

  async fetchWebhook(webhookId: string, token?: string) {
    return this.rest.get(Routes.webhook(webhookId, token), { auth: !token });
  }

  async fetchChannelWebhooks(channelId: string) {
    return this.rest.get(Routes.channelWebhooks(channelId));
  }

  async fetchGuildWebhooks(guildId: string) {
    return this.rest.get(Routes.guildWebhooks(guildId));
  }

  updatePresence(presence: PresenceUpdate): void {
    this.connection.send({
      op: 3,
      d: presence
    });
  }

  get api() {
    return this.rest;
  }

  get isReady() {
    return this.ready;
  }

  get ping() {
    return this.connection['heartbeat']?.ping ?? -1;
  }
}
