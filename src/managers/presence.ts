import { Client } from '../client/client';
import { Activity, ActivityType, StatusType, PresenceUpdate } from '../types/discord/presence';

export interface ActivityOptions {
  url?: string;
  platform?: string;
  application_id?: string;
  details?: string;
  state?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  buttons?: Array<{
    label: string;
    url: string;
  }>;
}

export class PresenceManager {
  private client: Client;
  private currentStatus: StatusType = StatusType.ONLINE;
  private currentActivities: Activity[] = [];

  constructor(client: Client) {
    this.client = client;
  }

  setStatus(status: StatusType): void {
    this.currentStatus = status;
    this.update();
  }

  setActivity(activity: Activity | null): void {
    this.currentActivities = activity ? [activity] : [];
    this.update();
  }

  setActivities(activities: Activity[]): void {
    this.currentActivities = activities;
    this.update();
  }

  setPresence(options: {
    status?: StatusType;
    activities?: Activity[];
    afk?: boolean;
    since?: number | null;
  }): void {
    if (options.status) {
      this.currentStatus = options.status;
    }
    if (options.activities !== undefined) {
      this.currentActivities = options.activities;
    }
    this.update(options.afk, options.since);
  }

  setPlaying(name: string, urlOrOptions?: string | ActivityOptions, platform?: string): void {
    const options = this.resolveActivityOptions(urlOrOptions, platform);
    this.setActivity({
      name,
      type: ActivityType.PLAYING,
      ...options
    });
  }

  setStreaming(name: string, url: string, optionsOrPlatform?: string | ActivityOptions): void {
    const options = this.resolveActivityOptions(optionsOrPlatform);
    this.setActivity({
      name,
      type: ActivityType.STREAMING,
      ...options,
      url
    });
  }

  setListening(name: string, optionsOrPlatform?: string | ActivityOptions): void {
    const options = this.resolveActivityOptions(optionsOrPlatform);
    this.setActivity({
      name,
      type: ActivityType.LISTENING,
      ...options
    });
  }

  setWatching(name: string, optionsOrPlatform?: string | ActivityOptions): void {
    const options = this.resolveActivityOptions(optionsOrPlatform);
    this.setActivity({
      name,
      type: ActivityType.WATCHING,
      ...options
    });
  }

  setCompeting(name: string, optionsOrPlatform?: string | ActivityOptions): void {
    const options = this.resolveActivityOptions(optionsOrPlatform);
    this.setActivity({
      name,
      type: ActivityType.COMPETING,
      ...options
    });
  }

  setCustom(text: string, emoji?: string | { name: string; id?: string; animated?: boolean }): void {
    const emojiData = typeof emoji === 'string' 
      ? { name: emoji }
      : emoji;

    this.setActivity({
      name: 'Custom Status',
      type: ActivityType.CUSTOM,
      state: text,
      emoji: emojiData
    });
  }

  clear(): void {
    this.currentActivities = [];
    this.update();
  }

  private resolveActivityOptions(value?: string | ActivityOptions, platform?: string): ActivityOptions {
    if (!value) {
      return platform ? { platform } : {};
    }

    if (typeof value === 'string') {
      if (platform !== undefined || /^https?:\/\//.test(value)) {
        return { url: value, platform };
      }
      return { platform: value };
    }

    return value;
  }

  private update(afk: boolean = false, since: number | null = null): void {
    const presence: PresenceUpdate = {
      since,
      activities: this.currentActivities,
      status: this.currentStatus,
      afk
    };

    this.client.updatePresence(presence);
  }

  get status(): StatusType {
    return this.currentStatus;
  }

  get activities(): Activity[] {
    return [...this.currentActivities];
  }
}
