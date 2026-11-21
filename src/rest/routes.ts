export const Routes = {
  channel: (id: string) => `/channels/${id}`,
  channelMessages: (id: string) => `/channels/${id}/messages`,
  channelMessage: (channelId: string, messageId: string) => `/channels/${channelId}/messages/${messageId}`,
  channelWebhooks: (id: string) => `/channels/${id}/webhooks`,
  
  guild: (id: string) => `/guilds/${id}`,
  guildChannels: (id: string) => `/guilds/${id}/channels`,
  guildMembers: (id: string) => `/guilds/${id}/members`,
  guildMember: (guildId: string, userId: string) => `/guilds/${guildId}/members/${userId}`,
  guildBan: (guildId: string, userId: string) => `/guilds/${guildId}/bans/${userId}`,
  guildBans: (id: string) => `/guilds/${id}/bans`,
  guildWebhooks: (id: string) => `/guilds/${id}/webhooks`,
  
  user: (id: string = '@me') => `/users/${id}`,
  userChannels: () => `/users/@me/channels`,
  userGuilds: () => `/users/@me/guilds`,
  
  typing: (channelId: string) => `/channels/${channelId}/typing`,
  
  reactions: (channelId: string, messageId: string, emoji: string) => 
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}`,
  
  reaction: (channelId: string, messageId: string, emoji: string, userId: string = '@me') =>
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}`,

  bulkDelete: (channelId: string) => `/channels/${channelId}/messages/bulk-delete`,

  webhook: (id: string, token?: string) => token ? `/webhooks/${id}/${token}` : `/webhooks/${id}`
} as const;

