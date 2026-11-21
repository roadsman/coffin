import { Base } from './base';
import { Client } from '../client/client';

export enum ChannelType {
  GUILD_TEXT = 0,
  DM = 1,
  GUILD_VOICE = 2,
  GROUP_DM = 3,
  GUILD_CATEGORY = 4,
  GUILD_ANNOUNCEMENT = 5,
  ANNOUNCEMENT_THREAD = 10,
  PUBLIC_THREAD = 11,
  PRIVATE_THREAD = 12,
  GUILD_STAGE_VOICE = 13,
  GUILD_DIRECTORY = 14,
  GUILD_FORUM = 15,
  GUILD_MEDIA = 16
}

export interface ChannelData {
  id: string;
  type: number;
  guild_id?: string;
  position?: number;
  name?: string;
  topic?: string | null;
  nsfw?: boolean;
  last_message_id?: string | null;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: any[];
  icon?: string | null;
  owner_id?: string;
  parent_id?: string | null;
  last_pin_timestamp?: string | null;
  rtc_region?: string | null;
  video_quality_mode?: number;
  message_count?: number;
  member_count?: number;
  thread_metadata?: {
    archived: boolean;
    auto_archive_duration: number;
    archive_timestamp: string;
    locked: boolean;
    invitable?: boolean;
    create_timestamp?: string;
  };
  permission_overwrites?: Array<{
    id: string;
    type: number;
    allow: string;
    deny: string;
  }>;
  flags?: number;
}

export class Channel extends Base {
  id: string;
  type: ChannelType;
  guildId: string | null;
  position: number | null;
  name: string | null;
  topic: string | null;
  nsfw: boolean;
  lastMessageId: string | null;
  parentId: string | null;
  rateLimitPerUser: number;
  bitrate: number | null;
  userLimit: number | null;
  rtcRegion: string | null;
  videoQualityMode: number | null;
  messageCount: number | null;
  memberCount: number | null;
  permissionOverwrites: Array<{
    id: string;
    type: number;
    allow: string;
    deny: string;
  }>;
  threadMetadata: {
    archived: boolean;
    autoArchiveDuration: number;
    archiveTimestamp: Date;
    locked: boolean;
    invitable?: boolean;
  } | null;
  flags: number;

  constructor(client: Client, data: ChannelData) {
    super(client);
    this.id = data.id;
    this.type = data.type;
    this.guildId = data.guild_id ?? null;
    this.position = data.position ?? null;
    this.name = data.name ?? null;
    this.topic = data.topic ?? null;
    this.nsfw = data.nsfw ?? false;
    this.lastMessageId = data.last_message_id ?? null;
    this.parentId = data.parent_id ?? null;
    this.rateLimitPerUser = data.rate_limit_per_user ?? 0;
    this.bitrate = data.bitrate ?? null;
    this.userLimit = data.user_limit ?? null;
    this.rtcRegion = data.rtc_region ?? null;
    this.videoQualityMode = data.video_quality_mode ?? null;
    this.messageCount = data.message_count ?? null;
    this.memberCount = data.member_count ?? null;
    this.permissionOverwrites = data.permission_overwrites ?? [];
    this.threadMetadata = data.thread_metadata ? {
      archived: data.thread_metadata.archived,
      autoArchiveDuration: data.thread_metadata.auto_archive_duration,
      archiveTimestamp: new Date(data.thread_metadata.archive_timestamp),
      locked: data.thread_metadata.locked,
      invitable: data.thread_metadata.invitable
    } : null;
    this.flags = data.flags ?? 0;
  }

  get mention(): string {
    return `<#${this.id}>`;
  }

  get url(): string {
    const guildId = this.guildId ?? '@me';
    return `https://discord.com/channels/${guildId}/${this.id}`;
  }

  get isDM(): boolean {
    return this.type === ChannelType.DM;
  }

  get isThread(): boolean {
    return [
      ChannelType.ANNOUNCEMENT_THREAD,
      ChannelType.PUBLIC_THREAD,
      ChannelType.PRIVATE_THREAD
    ].includes(this.type);
  }

  get isText(): boolean {
    return [
      ChannelType.GUILD_TEXT,
      ChannelType.DM,
      ChannelType.GUILD_ANNOUNCEMENT,
      ChannelType.ANNOUNCEMENT_THREAD,
      ChannelType.PUBLIC_THREAD,
      ChannelType.PRIVATE_THREAD
    ].includes(this.type);
  }

  get isVoice(): boolean {
    return [
      ChannelType.GUILD_VOICE,
      ChannelType.GUILD_STAGE_VOICE
    ].includes(this.type);
  }

  async send(content: string | { content?: string; embeds?: any[]; [key: string]: any }) {
    return this.client.sendMessage(this.id, content);
  }

  async fetch() {
    return this.client.fetchChannel(this.id);
  }

  async typing() {
    return this.client.typing(this.id);
  }

  toString(): string {
    return this.mention;
  }
}
