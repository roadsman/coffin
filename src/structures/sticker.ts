import { Base } from './base';
import { Client } from '../client/client';

export enum StickerType {
  STANDARD = 1,
  GUILD = 2
}

export enum StickerFormatType {
  PNG = 1,
  APNG = 2,
  LOTTIE = 3,
  GIF = 4
}

export interface StickerData {
  id: string;
  pack_id?: string;
  name: string;
  description: string | null;
  tags: string;
  type: number;
  format_type: number;
  available?: boolean;
  guild_id?: string;
  user?: any;
  sort_value?: number;
}

export class Sticker extends Base {
  id: string;
  packId: string | null;
  name: string;
  description: string | null;
  tags: string[];
  type: StickerType;
  formatType: StickerFormatType;
  available: boolean;
  guildId: string | null;
  sortValue: number;

  constructor(client: Client, data: StickerData) {
    super(client);
    this.id = data.id;
    this.packId = data.pack_id ?? null;
    this.name = data.name;
    this.description = data.description;
    this.tags = data.tags.split(', ');
    this.type = data.type;
    this.formatType = data.format_type;
    this.available = data.available ?? true;
    this.guildId = data.guild_id ?? null;
    this.sortValue = data.sort_value ?? 0;
  }

  get url(): string {
    const extension = this.formatType === StickerFormatType.LOTTIE ? 'json' : 'png';
    return `https://cdn.discordapp.com/stickers/${this.id}.${extension}`;
  }

  get isGuildSticker(): boolean {
    return this.type === StickerType.GUILD;
  }

  get isAnimated(): boolean {
    return this.formatType === StickerFormatType.APNG || 
           this.formatType === StickerFormatType.LOTTIE ||
           this.formatType === StickerFormatType.GIF;
  }

  toString(): string {
    return this.name;
  }
}
