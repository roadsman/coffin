import { Base } from './base';
import { Client } from '../client/client';
import { Routes } from '../rest/routes';

export enum WebhookType {
  INCOMING = 1,
  CHANNEL_FOLLOWER = 2,
  APPLICATION = 3
}

export interface WebhookData {
  id: string;
  type: number;
  guild_id?: string;
  channel_id: string;
  user?: any;
  name: string | null;
  avatar: string | null;
  token?: string;
  application_id: string | null;
  source_guild?: any;
  source_channel?: any;
  url?: string;
}

export class Webhook extends Base {
  id: string;
  type: WebhookType;
  guildId: string | null;
  channelId: string;
  name: string | null;
  avatar: string | null;
  token: string | null;
  applicationId: string | null;
  url: string | null;

  constructor(client: Client, data: WebhookData) {
    super(client);
    this.id = data.id;
    this.type = data.type;
    this.guildId = data.guild_id ?? null;
    this.channelId = data.channel_id;
    this.name = data.name;
    this.avatar = data.avatar;
    this.token = data.token ?? null;
    this.applicationId = data.application_id;
    this.url = data.url ?? null;
  }

  get avatarURL(): string | null {
    if (!this.avatar) return null;
    return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.png`;
  }

  async send(content: string | {
    content?: string;
    username?: string;
    avatar_url?: string;
    embeds?: any[];
    allowed_mentions?: any;
    components?: any[];
    files?: any[];
    thread_id?: string;
  }): Promise<any> {
    if (!this.token) {
      throw new Error('Webhook token is required to send messages');
    }

    const body = typeof content === 'string' ? { content } : content;
    
    return this.client.rest.post(
      Routes.webhook(this.id, this.token ?? undefined),
      { body, auth: false }
    );
  }

  async edit(options: {
    name?: string;
    avatar?: string | null;
    channel_id?: string;
  }): Promise<Webhook> {
    const data = await this.client.rest.patch(
      Routes.webhook(this.id, this.token ?? undefined),
      { body: options, auth: !this.token }
    );
    return new Webhook(this.client, data);
  }

  async delete(reason?: string): Promise<void> {
    await this.client.rest.delete(
      Routes.webhook(this.id, this.token ?? undefined),
      { reason, auth: !this.token }
    );
  }

  toString(): string {
    return this.name ?? 'Unknown Webhook';
  }
}
