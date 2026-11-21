export const Permissions = {
  CREATE_INSTANT_INVITE: 1n << 0n,
  KICK_MEMBERS: 1n << 1n,
  BAN_MEMBERS: 1n << 2n,
  ADMINISTRATOR: 1n << 3n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_GUILD: 1n << 5n,
  ADD_REACTIONS: 1n << 6n,
  VIEW_AUDIT_LOG: 1n << 7n,
  PRIORITY_SPEAKER: 1n << 8n,
  STREAM: 1n << 9n,
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  SEND_TTS_MESSAGES: 1n << 12n,
  MANAGE_MESSAGES: 1n << 13n,
  EMBED_LINKS: 1n << 14n,
  ATTACH_FILES: 1n << 15n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  MENTION_EVERYONE: 1n << 17n,
  USE_EXTERNAL_EMOJIS: 1n << 18n,
  VIEW_GUILD_INSIGHTS: 1n << 19n,
  CONNECT: 1n << 20n,
  SPEAK: 1n << 21n,
  MUTE_MEMBERS: 1n << 22n,
  DEAFEN_MEMBERS: 1n << 23n,
  MOVE_MEMBERS: 1n << 24n,
  USE_VAD: 1n << 25n,
  CHANGE_NICKNAME: 1n << 26n,
  MANAGE_NICKNAMES: 1n << 27n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_WEBHOOKS: 1n << 29n,
  MANAGE_GUILD_EXPRESSIONS: 1n << 30n,
  USE_APPLICATION_COMMANDS: 1n << 31n,
  REQUEST_TO_SPEAK: 1n << 32n,
  MANAGE_EVENTS: 1n << 33n,
  MANAGE_THREADS: 1n << 34n,
  CREATE_PUBLIC_THREADS: 1n << 35n,
  CREATE_PRIVATE_THREADS: 1n << 36n,
  USE_EXTERNAL_STICKERS: 1n << 37n,
  SEND_MESSAGES_IN_THREADS: 1n << 38n,
  USE_EMBEDDED_ACTIVITIES: 1n << 39n,
  MODERATE_MEMBERS: 1n << 40n,
  VIEW_CREATOR_MONETIZATION_ANALYTICS: 1n << 41n,
  USE_SOUNDBOARD: 1n << 42n,
  USE_EXTERNAL_SOUNDS: 1n << 45n,
  SEND_VOICE_MESSAGES: 1n << 46n
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

export class PermissionsBitfield {
  private bits: bigint;

  constructor(bits: bigint | string | number = 0n) {
    if (typeof bits === 'string') {
      this.bits = BigInt(bits);
    } else if (typeof bits === 'number') {
      this.bits = BigInt(bits);
    } else {
      this.bits = bits;
    }
  }

  has(permission: Permission | bigint): boolean {
    const perm = typeof permission === 'bigint' ? permission : BigInt(permission);
    return (this.bits & perm) === perm;
  }

  hasAll(...permissions: (Permission | bigint)[]): boolean {
    return permissions.every(p => this.has(p));
  }

  hasAny(...permissions: (Permission | bigint)[]): boolean {
    return permissions.some(p => this.has(p));
  }

  add(...permissions: (Permission | bigint)[]): this {
    for (const perm of permissions) {
      const p = typeof perm === 'bigint' ? perm : BigInt(perm);
      this.bits |= p;
    }
    return this;
  }

  remove(...permissions: (Permission | bigint)[]): this {
    for (const perm of permissions) {
      const p = typeof perm === 'bigint' ? perm : BigInt(perm);
      this.bits &= ~p;
    }
    return this;
  }

  toggle(...permissions: (Permission | bigint)[]): this {
    for (const perm of permissions) {
      const p = typeof perm === 'bigint' ? perm : BigInt(perm);
      this.bits ^= p;
    }
    return this;
  }

  missing(...permissions: (Permission | bigint)[]): (Permission | bigint)[] {
    return permissions.filter(p => !this.has(p));
  }

  toArray(): bigint[] {
    const perms: bigint[] = [];
    for (const value of Object.values(Permissions)) {
      if (typeof value === 'bigint' && this.has(value)) {
        perms.push(value);
      }
    }
    return perms;
  }

  toString(): string {
    return this.bits.toString();
  }

  valueOf(): bigint {
    return this.bits;
  }

  equals(other: PermissionsBitfield | bigint): boolean {
    const otherBits = other instanceof PermissionsBitfield ? other.bits : other;
    return this.bits === otherBits;
  }

  static all(): PermissionsBitfield {
    let bits = 0n;
    for (const value of Object.values(Permissions)) {
      if (typeof value === 'bigint') {
        bits |= value;
      }
    }
    return new PermissionsBitfield(bits);
  }

  static default(): PermissionsBitfield {
    return new PermissionsBitfield(
      Permissions.VIEW_CHANNEL |
      Permissions.SEND_MESSAGES |
      Permissions.READ_MESSAGE_HISTORY |
      Permissions.ADD_REACTIONS |
      Permissions.EMBED_LINKS |
      Permissions.ATTACH_FILES |
      Permissions.USE_EXTERNAL_EMOJIS |
      Permissions.CONNECT |
      Permissions.SPEAK |
      Permissions.USE_VAD
    );
  }
}
