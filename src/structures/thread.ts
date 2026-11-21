import { Channel, ChannelData, ChannelType } from './channel';
import { Client } from '../client/client';

export interface ThreadMetadata {
  archived: boolean;
  autoArchiveDuration: number;
  archiveTimestamp: Date;
  locked: boolean;
  invitable?: boolean;
  createTimestamp?: Date;
}

export class ThreadChannel extends Channel {
  ownerId: string;
  messageCount: number;
  memberCount: number;
  threadMetadata: ThreadMetadata;

  constructor(client: Client, data: ChannelData) {
    super(client, data);
    this.ownerId = data.owner_id ?? '';
    this.messageCount = data.message_count ?? 0;
    this.memberCount = data.member_count ?? 0;
    
    if (data.thread_metadata) {
      this.threadMetadata = {
        archived: data.thread_metadata.archived,
        autoArchiveDuration: data.thread_metadata.auto_archive_duration,
        archiveTimestamp: new Date(data.thread_metadata.archive_timestamp),
        locked: data.thread_metadata.locked,
        invitable: data.thread_metadata.invitable,
        createTimestamp: data.thread_metadata.create_timestamp 
          ? new Date(data.thread_metadata.create_timestamp) 
          : undefined
      };
    } else {
      this.threadMetadata = {
        archived: false,
        autoArchiveDuration: 1440,
        archiveTimestamp: new Date(),
        locked: false
      };
    }
  }

  get isArchived(): boolean {
    return this.threadMetadata.archived;
  }

  get isLocked(): boolean {
    return this.threadMetadata.locked;
  }

  get isPublic(): boolean {
    return this.type === ChannelType.PUBLIC_THREAD;
  }

  get isPrivate(): boolean {
    return this.type === ChannelType.PRIVATE_THREAD;
  }

  get isNews(): boolean {
    return this.type === ChannelType.ANNOUNCEMENT_THREAD;
  }

  async join() {
    return this.client.rest.put(`/channels/${this.id}/thread-members/@me`);
  }

  async leave() {
    return this.client.rest.delete(`/channels/${this.id}/thread-members/@me`);
  }

  async addMember(userId: string) {
    return this.client.rest.put(`/channels/${this.id}/thread-members/${userId}`);
  }

  async removeMember(userId: string) {
    return this.client.rest.delete(`/channels/${this.id}/thread-members/${userId}`);
  }

  async setArchived(archived: boolean, reason?: string) {
    return this.client.rest.patch(`/channels/${this.id}`, {
      body: {
        archived,
        locked: this.threadMetadata.locked
      },
      reason
    });
  }

  async setLocked(locked: boolean, reason?: string) {
    return this.client.rest.patch(`/channels/${this.id}`, {
      body: {
        archived: this.threadMetadata.archived,
        locked
      },
      reason
    });
  }
}
