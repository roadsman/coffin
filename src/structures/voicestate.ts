import { Base } from './base';
import { Client } from '../client/client';
import { GuildMember, MemberData } from './member';

export interface VoiceStateData {
  guild_id?: string;
  channel_id: string | null;
  user_id: string;
  member?: MemberData;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_stream?: boolean;
  self_video: boolean;
  suppress: boolean;
  request_to_speak_timestamp: string | null;
}

export class VoiceState extends Base {
  guildId: string | null;
  channelId: string | null;
  userId: string;
  member: GuildMember | null;
  sessionId: string;
  deaf: boolean;
  mute: boolean;
  selfDeaf: boolean;
  selfMute: boolean;
  selfStream: boolean;
  selfVideo: boolean;
  suppress: boolean;
  requestToSpeakTimestamp: Date | null;

  constructor(client: Client, data: VoiceStateData) {
    super(client);
    this.guildId = data.guild_id ?? null;
    this.channelId = data.channel_id;
    this.userId = data.user_id;
    this.member = data.member && data.guild_id 
      ? new GuildMember(client, data.member, data.guild_id) 
      : null;
    this.sessionId = data.session_id;
    this.deaf = data.deaf;
    this.mute = data.mute;
    this.selfDeaf = data.self_deaf;
    this.selfMute = data.self_mute;
    this.selfStream = data.self_stream ?? false;
    this.selfVideo = data.self_video;
    this.suppress = data.suppress;
    this.requestToSpeakTimestamp = data.request_to_speak_timestamp 
      ? new Date(data.request_to_speak_timestamp) 
      : null;
  }

  get isDeafened(): boolean {
    return this.deaf || this.selfDeaf;
  }

  get isMuted(): boolean {
    return this.mute || this.selfMute;
  }

  get isStreaming(): boolean {
    return this.selfStream;
  }

  get hasVideo(): boolean {
    return this.selfVideo;
  }

  get isSuppressed(): boolean {
    return this.suppress;
  }

  get isInChannel(): boolean {
    return this.channelId !== null;
  }

  get wantsToSpeak(): boolean {
    return this.requestToSpeakTimestamp !== null;
  }
}
