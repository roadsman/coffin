import { Client } from '../client/client';
import { Activity, ActivityType, StatusType, PresenceUpdate } from '../types/discord/presence';

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

  setPlaying(name: string, url?: string): void {
    this.setActivity({
      name,
      type: ActivityType.PLAYING,
      url
    });
  }

  setStreaming(name: string, url: string): void {
    this.setActivity({
      name,
      type: ActivityType.STREAMING,
      url
    });
  }

  setListening(name: string): void {
    this.setActivity({
      name,
      type: ActivityType.LISTENING
    });
  }

  setWatching(name: string): void {
    this.setActivity({
      name,
      type: ActivityType.WATCHING
    });
  }

  setCompeting(name: string): void {
    this.setActivity({
      name,
      type: ActivityType.COMPETING
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
