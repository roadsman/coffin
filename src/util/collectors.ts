import { EventEmitter } from 'events';
import { Message } from '../structures/message';
import { Client } from '../client/client';

export interface CollectorOptions {
  time?: number;
  max?: number;
  filter?: (item: any) => boolean;
  dispose?: boolean;
}

export class MessageCollector extends EventEmitter {
  private client: Client;
  private channelId: string;
  private filter: (message: Message) => boolean;
  private collected = new Map<string, Message>();
  private ended = false;
  private timeout: NodeJS.Timeout | null = null;
  private max: number;
  private handleCollect: (message: Message) => void;

  constructor(client: Client, channelId: string, options: CollectorOptions = {}) {
    super();
    this.client = client;
    this.channelId = channelId;
    this.filter = options.filter ?? (() => true);
    this.max = options.max ?? Infinity;

    this.handleCollect = this.onCollect.bind(this);
    this.client.on('messageCreate', this.handleCollect);

    if (options.time) {
      this.timeout = setTimeout(() => this.stop('time'), options.time);
    }
  }

  private onCollect(message: Message) {
    if (this.ended) return;
    if (message.channelId !== this.channelId) return;
    
    try {
      if (!this.filter(message)) return;
    } catch (error) {
      this.emit('error', error);
      return;
    }

    this.collected.set(message.id, message);
    this.emit('collect', message);

    if (this.collected.size >= this.max) {
      this.stop('limit');
    }
  }

  stop(reason: string = 'user') {
    if (this.ended) return;
    
    this.ended = true;
    this.client.removeListener('messageCreate', this.handleCollect);
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.emit('end', this.collected, reason);
    this.removeAllListeners();
  }

  get size(): number {
    return this.collected.size;
  }

  get messages(): Map<string, Message> {
    return new Map(this.collected);
  }
}

export class ReactionCollector extends EventEmitter {
  private client: Client;
  private messageId: string;
  private filter: (userId: string, emoji: string) => boolean;
  private collected = new Map<string, Set<string>>();
  private ended = false;
  private timeout: NodeJS.Timeout | null = null;
  private max: number;
  private handleAdd: (data: any) => void;
  private handleRemove: (data: any) => void;

  constructor(client: Client, messageId: string, options: CollectorOptions = {}) {
    super();
    this.client = client;
    this.messageId = messageId;
    this.filter = options.filter ?? (() => true);
    this.max = options.max ?? Infinity;

    this.handleAdd = this.onAdd.bind(this);
    this.handleRemove = this.onRemove.bind(this);

    this.client.on('messageReactionAdd', this.handleAdd);
    
    if (options.dispose) {
      this.client.on('messageReactionRemove', this.handleRemove);
    }

    if (options.time) {
      this.timeout = setTimeout(() => this.stop('time'), options.time);
    }
  }

  private onAdd(data: any) {
    if (this.ended) return;
    if (data.message_id !== this.messageId) return;

    const emoji = data.emoji.id ?? data.emoji.name;
    const userId = data.user_id;

    try {
      if (!this.filter(userId, emoji)) return;
    } catch (error) {
      this.emit('error', error);
      return;
    }

    if (!this.collected.has(emoji)) {
      this.collected.set(emoji, new Set());
    }

    this.collected.get(emoji)!.add(userId);
    this.emit('collect', { userId, emoji });

    if (this.totalReactions >= this.max) {
      this.stop('limit');
    }
  }

  private onRemove(data: any) {
    if (this.ended) return;
    if (data.message_id !== this.messageId) return;

    const emoji = data.emoji.id ?? data.emoji.name;
    const userId = data.user_id;

    const users = this.collected.get(emoji);
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        this.collected.delete(emoji);
      }
      this.emit('remove', { userId, emoji });
    }
  }

  stop(reason: string = 'user') {
    if (this.ended) return;
    
    this.ended = true;
    this.client.removeListener('messageReactionAdd', this.handleAdd);
    this.client.removeListener('messageReactionRemove', this.handleRemove);
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.emit('end', this.collected, reason);
    this.removeAllListeners();
  }

  get totalReactions(): number {
    let total = 0;
    for (const users of this.collected.values()) {
      total += users.size;
    }
    return total;
  }

  get reactions(): Map<string, Set<string>> {
    return new Map(this.collected);
  }
}
