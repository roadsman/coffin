export interface GatewayPayload {
  op: number;
  d: any;
  s?: number | null;
  t?: string | null;
}

export interface HelloPayload {
  heartbeat_interval: number;
  _trace: string[];
}

export interface ReadyPayload {
  v: number;
  user: any;
  guilds: any[];
  session_id: string;
  resume_gateway_url: string;
  shard?: [number, number];
  application: any;
}

export interface IdentifyPayload {
  token: string;
  properties: ClientProperties;
  compress?: boolean;
  capabilities?: number;
  presence?: PresenceData;
  client_state?: ClientState;
}

export interface ClientProperties {
  os: string;
  browser: string;
  device: string;
  system_locale: string;
  browser_user_agent: string;
  browser_version: string;
  os_version: string;
  referrer: string;
  referring_domain: string;
  referrer_current: string;
  referring_domain_current: string;
  release_channel: string;
  client_build_number: number;
  client_event_source: null;
}

export interface PresenceData {
  status: string;
  since: number;
  activities: Activity[];
  afk: boolean;
}

export interface Activity {
  name: string;
  type: number;
  url?: string;
}

export interface ClientState {
  guild_versions: Record<string, number>;
  highest_last_message_id?: string;
  read_state_version?: number;
  user_guild_settings_version?: number;
  user_settings_version?: number;
  private_channels_version?: string;
  api_code_version?: number;
}

export interface ResumePayload {
  token: string;
  session_id: string;
  seq: number;
}
