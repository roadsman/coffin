import { Base } from './base';
import { Client } from '../client/client';
import { User, UserData } from './user';

export interface MessageData {
  id: string;
  channel_id: string;
  author: UserData;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: UserData[];
  mention_roles: string[];
  attachments: any[];
  embeds: any[];
  reactions?: any[];
  nonce?: string | number;
  pinned: boolean;
  webhook_id?: string;
  type: number;
  flags?: number;
  referenced_message?: MessageData | null;
  guild_id?: string;
  message_reference?: {
    message_id?: string;
    channel_id?: string;
    guild_id?: string;
  };
  sticker_items?: Array<{
    id: string;
    name: string;
    format_type: number;
  }>;
  components?: any[];
  interaction?: {
    id: string;
    type: number;
    name: string;
    user: UserData;
  };
  application_id?: string;
}

export class Message extends Base {
  id: string;
  channelId: string;
  author: User;
  content: string;
  timestamp: Date;
  editedTimestamp: Date | null;
  tts: boolean;
  mentionEveryone: boolean;
  mentions: User[];
  mentionRoles: string[];
  attachments: any[];
  embeds: any[];
  reactions: any[];
  pinned: boolean;
  type: number;
  flags: number;
  guildId: string | null;
  webhookId: string | null;
  messageReference: {
    messageId?: string;
    channelId?: string;
    guildId?: string;
  } | null;
  referencedMessage: Message | null;
  stickerItems: Array<{ id: string; name: string; formatType: number }>;
  components: any[];
  interaction: {
    id: string;
    type: number;
    name: string;
    user: User;
  } | null;
  applicationId: string | null;

  constructor(client: Client, data: MessageData) {
    super(client);
    this.id = data.id;
    this.channelId = data.channel_id;
    this.author = new User(client, data.author);
    this.content = data.content;
    this.timestamp = new Date(data.timestamp);
    this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp) : null;
    this.tts = data.tts;
    this.mentionEveryone = data.mention_everyone;
    this.mentions = data.mentions.map(u => new User(client, u));
    this.mentionRoles = data.mention_roles;
    this.attachments = data.attachments;
    this.embeds = data.embeds;
    this.reactions = data.reactions ?? [];
    this.pinned = data.pinned;
    this.type = data.type;
    this.flags = data.flags ?? 0;
    this.guildId = data.guild_id ?? null;
    this.webhookId = data.webhook_id ?? null;
    this.messageReference = data.message_reference ? {
      messageId: data.message_reference.message_id,
      channelId: data.message_reference.channel_id,
      guildId: data.message_reference.guild_id
    } : null;
    this.referencedMessage = data.referenced_message ? new Message(client, data.referenced_message) : null;
    this.stickerItems = data.sticker_items?.map(s => ({
      id: s.id,
      name: s.name,
      formatType: s.format_type
    })) ?? [];
    this.components = data.components ?? [];
    this.interaction = data.interaction ? {
      id: data.interaction.id,
      type: data.interaction.type,
      name: data.interaction.name,
      user: new User(client, data.interaction.user)
    } : null;
    this.applicationId = data.application_id ?? null;
  }

  get url(): string {
    const guildId = this.guildId ?? '@me';
    return `https://discord.com/channels/${guildId}/${this.channelId}/${this.id}`;
  }

  get createdAt(): Date {
    return this.timestamp;
  }

  get editedAt(): Date | null {
    return this.editedTimestamp;
  }

  async reply(content: string | { content?: string; embeds?: any[]; [key: string]: any }) {
    const body = typeof content === 'string' ? { content } : content;
    const payload: any = {
      ...body,
      message_reference: {
        message_id: this.id
      }
    };
    
    if (this.channelId) {
      payload.message_reference.channel_id = this.channelId;
    }
    
    if (this.guildId) {
      payload.message_reference.guild_id = this.guildId;
    }
    
    return this.client.sendMessage(this.channelId, payload);
  }

  async edit(content: string | { content?: string; embeds?: any[]; [key: string]: any }) {
    return this.client.editMessage(this.channelId, this.id, content);
  }

  async delete() {
    return this.client.deleteMessage(this.channelId, this.id);
  }

  async react(emoji: string) {
    return this.client.addReaction(this.channelId, this.id, emoji);
  }

  toString(): string {
    return this.content;
  }
}
