export interface AttachmentData {
  id: string;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number | null;
  width?: number | null;
  ephemeral?: boolean;
  duration_secs?: number;
  waveform?: string;
  flags?: number;
}

export interface AttachmentPayload {
  id: number;
  filename: string;
  description?: string;
  content_type?: string;
}
