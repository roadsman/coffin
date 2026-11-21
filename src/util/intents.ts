export enum Intents {
  GUILDS = 1 << 0,
  GUILD_MEMBERS = 1 << 1,
  GUILD_MODERATION = 1 << 2,
  GUILD_EMOJIS_AND_STICKERS = 1 << 3,
  GUILD_INTEGRATIONS = 1 << 4,
  GUILD_WEBHOOKS = 1 << 5,
  GUILD_INVITES = 1 << 6,
  GUILD_VOICE_STATES = 1 << 7,
  GUILD_PRESENCES = 1 << 8,
  GUILD_MESSAGES = 1 << 9,
  GUILD_MESSAGE_REACTIONS = 1 << 10,
  GUILD_MESSAGE_TYPING = 1 << 11,
  DIRECT_MESSAGES = 1 << 12,
  DIRECT_MESSAGE_REACTIONS = 1 << 13,
  DIRECT_MESSAGE_TYPING = 1 << 14,
  MESSAGE_CONTENT = 1 << 15,
  GUILD_SCHEDULED_EVENTS = 1 << 16,
  AUTO_MODERATION_CONFIGURATION = 1 << 20,
  AUTO_MODERATION_EXECUTION = 1 << 21,
  GUILD_MESSAGE_POLLS = 1 << 24,
  DIRECT_MESSAGE_POLLS = 1 << 25
}

export class IntentsBitfield {
  private bits: number;

  constructor(bits: number | Intents[] = 0) {
    if (Array.isArray(bits)) {
      this.bits = bits.reduce((acc, intent) => acc | intent, 0);
    } else {
      this.bits = bits;
    }
  }

  add(...intents: Intents[]): this {
    for (const intent of intents) {
      this.bits |= intent;
    }
    return this;
  }

  remove(...intents: Intents[]): this {
    for (const intent of intents) {
      this.bits &= ~intent;
    }
    return this;
  }

  has(intent: Intents): boolean {
    return (this.bits & intent) === intent;
  }

  missing(...intents: Intents[]): Intents[] {
    return intents.filter(intent => !this.has(intent));
  }

  toArray(): Intents[] {
    const intents: Intents[] = [];
    for (const intent of Object.values(Intents)) {
      if (typeof intent === 'number' && this.has(intent)) {
        intents.push(intent);
      }
    }
    return intents;
  }

  valueOf(): number {
    return this.bits;
  }

  toString(): string {
    return this.bits.toString();
  }

  static all(): number {
    return Object.values(Intents)
      .filter((v): v is number => typeof v === 'number')
      .reduce((acc, intent) => acc | intent, 0);
  }

  static none(): number {
    return 0;
  }

  static default(): number {
    return new IntentsBitfield([
      Intents.GUILDS,
      Intents.GUILD_MESSAGES,
      Intents.DIRECT_MESSAGES,
      Intents.MESSAGE_CONTENT
    ]).valueOf();
  }
}
