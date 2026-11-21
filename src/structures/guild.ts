import { Base } from './base';
import { Client } from '../client/client';

export interface GuildData {
  id: string;
  name: string;
  icon: string | null;
  splash: string | null;
  discovery_splash: string | null;
  owner_id: string;
  owner?: boolean;
  region?: string;
  afk_channel_id: string | null;
  afk_timeout: number;
  verification_level: number;
  default_message_notifications: number;
  explicit_content_filter: number;
  roles: any[];
  emojis: any[];
  features: string[];
  mfa_level: number;
  system_channel_id: string | null;
  system_channel_flags: number;
  rules_channel_id: string | null;
  vanity_url_code: string | null;
  description: string | null;
  banner: string | null;
  premium_tier: number;
  premium_subscription_count?: number;
  preferred_locale: string;
  public_updates_channel_id: string | null;
  nsfw_level: number;
  member_count?: number;
  stickers?: any[];
  max_presences?: number | null;
  max_members?: number;
  max_video_channel_users?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  welcome_screen?: {
    description: string | null;
    welcome_channels: Array<{
      channel_id: string;
      description: string;
      emoji_id: string | null;
      emoji_name: string | null;
    }>;
  };
}

export class Guild extends Base {
  id: string;
  name: string;
  icon: string | null;
  splash: string | null;
  discoverySplash: string | null;
  ownerId: string;
  owner: boolean;
  afkChannelId: string | null;
  afkTimeout: number;
  verificationLevel: number;
  defaultMessageNotifications: number;
  explicitContentFilter: number;
  roles: any[];
  emojis: any[];
  stickers: any[];
  features: string[];
  mfaLevel: number;
  systemChannelId: string | null;
  systemChannelFlags: number;
  rulesChannelId: string | null;
  vanityUrlCode: string | null;
  description: string | null;
  banner: string | null;
  premiumTier: number;
  premiumSubscriptionCount: number;
  preferredLocale: string;
  publicUpdatesChannelId: string | null;
  nsfwLevel: number;
  memberCount: number;
  maxMembers: number;
  maxPresences: number | null;
  maxVideoChannelUsers: number;
  approximateMemberCount: number;
  approximatePresenceCount: number;

  constructor(client: Client, data: GuildData) {
    super(client);
    this.id = data.id;
    this.name = data.name;
    this.icon = data.icon;
    this.splash = data.splash;
    this.discoverySplash = data.discovery_splash ?? null;
    this.ownerId = data.owner_id;
    this.owner = data.owner ?? false;
    this.afkChannelId = data.afk_channel_id;
    this.afkTimeout = data.afk_timeout;
    this.verificationLevel = data.verification_level;
    this.defaultMessageNotifications = data.default_message_notifications;
    this.explicitContentFilter = data.explicit_content_filter;
    this.roles = data.roles;
    this.emojis = data.emojis;
    this.stickers = data.stickers ?? [];
    this.features = data.features;
    this.mfaLevel = data.mfa_level;
    this.systemChannelId = data.system_channel_id;
    this.systemChannelFlags = data.system_channel_flags;
    this.rulesChannelId = data.rules_channel_id;
    this.vanityUrlCode = data.vanity_url_code;
    this.description = data.description;
    this.banner = data.banner;
    this.premiumTier = data.premium_tier;
    this.premiumSubscriptionCount = data.premium_subscription_count ?? 0;
    this.preferredLocale = data.preferred_locale;
    this.publicUpdatesChannelId = data.public_updates_channel_id;
    this.nsfwLevel = data.nsfw_level;
    this.memberCount = data.member_count ?? 0;
    this.maxMembers = data.max_members ?? 0;
    this.maxPresences = data.max_presences ?? null;
    this.maxVideoChannelUsers = data.max_video_channel_users ?? 0;
    this.approximateMemberCount = data.approximate_member_count ?? 0;
    this.approximatePresenceCount = data.approximate_presence_count ?? 0;
  }

  iconURL(options?: { size?: number; format?: 'png' | 'jpg' | 'webp' | 'gif' }): string | null {
    if (!this.icon) return null;
    
    const size = options?.size ?? 1024;
    const format = options?.format ?? (this.icon.startsWith('a_') ? 'gif' : 'png');
    
    return `https://cdn.discordapp.com/icons/${this.id}/${this.icon}.${format}?size=${size}`;
  }

  bannerURL(options?: { size?: number; format?: 'png' | 'jpg' | 'webp' }): string | null {
    if (!this.banner) return null;
    
    const size = options?.size ?? 1024;
    const format = options?.format ?? 'png';
    
    return `https://cdn.discordapp.com/banners/${this.id}/${this.banner}.${format}?size=${size}`;
  }

  splashURL(options?: { size?: number; format?: 'png' | 'jpg' | 'webp' }): string | null {
    if (!this.splash) return null;
    
    const size = options?.size ?? 1024;
    const format = options?.format ?? 'png';
    
    return `https://cdn.discordapp.com/splashes/${this.id}/${this.splash}.${format}?size=${size}`;
  }

  async fetch() {
    return this.client.fetchGuild(this.id);
  }

  toString(): string {
    return this.name;
  }
}
