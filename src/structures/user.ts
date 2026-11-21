import { Base } from './base';
import { Client } from '../client/client';

export interface UserData {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  banner_color?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  global_name?: string | null;
  avatar_decoration_data?: {
    asset: string;
    sku_id?: string;
  } | null;
}

export class User extends Base {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot: boolean;
  system: boolean;
  globalName: string | null;
  banner: string | null;
  bannerColor: string | null;
  accentColor: number | null;
  publicFlags: number;
  avatarDecorationData: { asset: string; skuId?: string } | null;

  constructor(client: Client, data: UserData) {
    super(client);
    this.id = data.id;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = data.avatar;
    this.bot = data.bot ?? false;
    this.system = data.system ?? false;
    this.globalName = data.global_name ?? null;
    this.banner = data.banner ?? null;
    this.bannerColor = data.banner_color ?? null;
    this.accentColor = data.accent_color ?? null;
    this.publicFlags = data.public_flags ?? 0;
    this.avatarDecorationData = data.avatar_decoration_data ? {
      asset: data.avatar_decoration_data.asset,
      skuId: data.avatar_decoration_data.sku_id
    } : null;
  }

  get tag(): string {
    return this.discriminator === '0' 
      ? this.username 
      : `${this.username}#${this.discriminator}`;
  }

  get mention(): string {
    return `<@${this.id}>`;
  }

  avatarURL(options?: { size?: number; format?: 'png' | 'jpg' | 'webp' | 'gif' }): string | null {
    if (!this.avatar) return null;
    
    const size = options?.size ?? 1024;
    const format = options?.format ?? (this.avatar.startsWith('a_') ? 'gif' : 'png');
    
    return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.${format}?size=${size}`;
  }

  defaultAvatarURL(): string {
    const index = this.discriminator === '0' 
      ? (parseInt(this.id) >> 22) % 6
      : parseInt(this.discriminator) % 5;
    
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }

  displayAvatarURL(options?: { size?: number; format?: 'png' | 'jpg' | 'webp' | 'gif' }): string {
    return this.avatarURL(options) ?? this.defaultAvatarURL();
  }

  bannerURL(options?: { size?: number; format?: 'png' | 'jpg' | 'webp' | 'gif' }): string | null {
    if (!this.banner) return null;
    
    const size = options?.size ?? 1024;
    const format = options?.format ?? (this.banner.startsWith('a_') ? 'gif' : 'png');
    
    return `https://cdn.discordapp.com/banners/${this.id}/${this.banner}.${format}?size=${size}`;
  }

  avatarDecorationURL(): string | null {
    if (!this.avatarDecorationData) return null;
    return `https://cdn.discordapp.com/avatar-decoration-presets/${this.avatarDecorationData.asset}.png`;
  }

  toString(): string {
    return this.mention;
  }
}
