import { Channel, ChannelType } from '../structures/channel';
import { Message } from '../structures/message';
import { Guild } from '../structures/guild';
import { User } from '../structures/user';

export function isTextChannel(channel: Channel): boolean {
  return channel.type === ChannelType.GUILD_TEXT || 
         channel.type === ChannelType.DM ||
         channel.type === ChannelType.GUILD_ANNOUNCEMENT;
}

export function isVoiceChannel(channel: Channel): boolean {
  return channel.type === ChannelType.GUILD_VOICE ||
         channel.type === ChannelType.GUILD_STAGE_VOICE;
}

export function isThreadChannel(channel: Channel): boolean {
  return channel.type === ChannelType.PUBLIC_THREAD ||
         channel.type === ChannelType.PRIVATE_THREAD ||
         channel.type === ChannelType.ANNOUNCEMENT_THREAD;
}

export function isDMChannel(channel: Channel): boolean {
  return channel.type === ChannelType.DM || channel.type === ChannelType.GROUP_DM;
}

export function isGuildChannel(channel: Channel): boolean {
  return channel.guildId !== null;
}

export function isCategoryChannel(channel: Channel): boolean {
  return channel.type === ChannelType.GUILD_CATEGORY;
}

export function isForumChannel(channel: Channel): boolean {
  return channel.type === ChannelType.GUILD_FORUM;
}

export function isMediaChannel(channel: Channel): boolean {
  return channel.type === ChannelType.GUILD_MEDIA;
}

export function isNewsChannel(channel: Channel): boolean {
  return channel.type === ChannelType.GUILD_ANNOUNCEMENT;
}

export function isStageChannel(channel: Channel): boolean {
  return channel.type === ChannelType.GUILD_STAGE_VOICE;
}

export function isBot(user: User): boolean {
  return user.bot;
}

export function isSystemMessage(message: Message): boolean {
  return message.type !== 0 && message.type !== 19 && message.type !== 20;
}

export function hasEmbeds(message: Message): boolean {
  return message.embeds.length > 0;
}

export function hasAttachments(message: Message): boolean {
  return message.attachments.length > 0;
}

export function isPinned(message: Message): boolean {
  return message.pinned;
}

export function isEdited(message: Message): boolean {
  return message.editedTimestamp !== null;
}
