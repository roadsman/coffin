import { Base } from './base';
import { Client } from '../client/client';
import { User, UserData } from './user';
import { PermissionsBitfield } from '../util/permissions';

export interface MemberData {
  user?: UserData;
  nick?: string | null;
  avatar?: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string | null;
}

export class GuildMember extends Base {
  user: User | null;
  nick: string | null;
  avatar: string | null;
  roles: string[];
  joinedAt: Date;
  premiumSince: Date | null;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending: boolean;
  permissions: PermissionsBitfield | null;
  communicationDisabledUntil: Date | null;
  guildId: string;

  constructor(client: Client, data: MemberData, guildId: string) {
    super(client);
    this.user = data.user ? new User(client, data.user) : null;
    this.nick = data.nick ?? null;
    this.avatar = data.avatar ?? null;
    this.roles = data.roles;
    this.joinedAt = new Date(data.joined_at);
    this.premiumSince = data.premium_since ? new Date(data.premium_since) : null;
    this.deaf = data.deaf;
    this.mute = data.mute;
    this.flags = data.flags;
    this.pending = data.pending ?? false;
    this.permissions = data.permissions ? new PermissionsBitfield(data.permissions) : null;
    this.communicationDisabledUntil = data.communication_disabled_until 
      ? new Date(data.communication_disabled_until) 
      : null;
    this.guildId = guildId;
  }

  get id(): string {
    return this.user?.id ?? '';
  }

  get displayName(): string {
    return this.nick ?? this.user?.username ?? 'Unknown';
  }

  get mention(): string {
    return `<@${this.id}>`;
  }

  get displayAvatarURL(): string {
    if (this.avatar) {
      return `https://cdn.discordapp.com/guilds/${this.guildId}/users/${this.id}/avatars/${this.avatar}.png`;
    }
    return this.user?.displayAvatarURL() ?? '';
  }

  get isCommunicationDisabled(): boolean {
    if (!this.communicationDisabledUntil) return false;
    return this.communicationDisabledUntil.getTime() > Date.now();
  }

  hasPermission(permission: bigint): boolean {
    if (!this.permissions) return false;
    return this.permissions.has(permission);
  }

  async kick(reason?: string) {
    return this.client.kickMember(this.guildId, this.id, reason);
  }

  async ban(options?: { deleteMessageDays?: number; reason?: string }) {
    return this.client.banMember(this.guildId, this.id, options);
  }

  async timeout(duration: number, reason?: string) {
    const until = new Date(Date.now() + duration);
    return this.client.timeoutMember(this.guildId, this.id, until, reason);
  }

  async removeTimeout(reason?: string) {
    return this.client.removeTimeout(this.guildId, this.id, reason);
  }

  toString(): string {
    return this.mention;
  }
}
