import { Base } from './base';
import { Client } from '../client/client';

export enum AutoModTriggerType {
  KEYWORD = 1,
  SPAM = 3,
  KEYWORD_PRESET = 4,
  MENTION_SPAM = 5
}

export enum AutoModEventType {
  MESSAGE_SEND = 1
}

export enum AutoModActionType {
  BLOCK_MESSAGE = 1,
  SEND_ALERT_MESSAGE = 2,
  TIMEOUT = 3
}

export enum KeywordPresetType {
  PROFANITY = 1,
  SEXUAL_CONTENT = 2,
  SLURS = 3
}

export interface AutoModRuleData {
  id: string;
  guild_id: string;
  name: string;
  creator_id: string;
  event_type: number;
  trigger_type: number;
  trigger_metadata: any;
  actions: Array<{
    type: number;
    metadata?: any;
  }>;
  enabled: boolean;
  exempt_roles: string[];
  exempt_channels: string[];
}

export class AutoModRule extends Base {
  id: string;
  guildId: string;
  name: string;
  creatorId: string;
  eventType: AutoModEventType;
  triggerType: AutoModTriggerType;
  triggerMetadata: any;
  actions: Array<{
    type: AutoModActionType;
    metadata?: any;
  }>;
  enabled: boolean;
  exemptRoles: string[];
  exemptChannels: string[];

  constructor(client: Client, data: AutoModRuleData) {
    super(client);
    this.id = data.id;
    this.guildId = data.guild_id;
    this.name = data.name;
    this.creatorId = data.creator_id;
    this.eventType = data.event_type;
    this.triggerType = data.trigger_type;
    this.triggerMetadata = data.trigger_metadata;
    this.actions = data.actions.map(a => ({
      type: a.type,
      metadata: a.metadata
    }));
    this.enabled = data.enabled;
    this.exemptRoles = data.exempt_roles;
    this.exemptChannels = data.exempt_channels;
  }

  get isKeywordFilter(): boolean {
    return this.triggerType === AutoModTriggerType.KEYWORD;
  }

  get isSpamFilter(): boolean {
    return this.triggerType === AutoModTriggerType.SPAM;
  }

  get isMentionSpamFilter(): boolean {
    return this.triggerType === AutoModTriggerType.MENTION_SPAM;
  }

  get hasBlockAction(): boolean {
    return this.actions.some(a => a.type === AutoModActionType.BLOCK_MESSAGE);
  }

  get hasAlertAction(): boolean {
    return this.actions.some(a => a.type === AutoModActionType.SEND_ALERT_MESSAGE);
  }

  get hasTimeoutAction(): boolean {
    return this.actions.some(a => a.type === AutoModActionType.TIMEOUT);
  }

  toString(): string {
    return this.name;
  }
}
