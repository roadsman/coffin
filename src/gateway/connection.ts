import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { Gateway, Opcodes, CloseCodes } from '../util/constants';
import { Fingerprint } from '../util/fingerprint';
import { Heartbeat } from './heartbeat';
import {
  GatewayPayload,
  HelloPayload,
  IdentifyPayload,
  ReadyPayload,
  ResumePayload,
  ClientState
} from '../types/discord/gateway';

export interface ConnectionOptions {
  token: string;
  intents: number;
  properties?: Partial<ReturnType<typeof Fingerprint.getProperties>>;
  capabilities?: number;
  compress?: boolean;
}

export class Connection extends EventEmitter {
  private ws: WebSocket | null = null;
  private heartbeat: Heartbeat | null = null;
  private sequence: number | null = null;
  private sessionId: string | null = null;
  private resumeUrl: string | null = null;
  private token: string;
  private intents: number;
  private properties: ReturnType<typeof Fingerprint.getProperties>;
  private capabilities: number;

  constructor(options: ConnectionOptions) {
    super();
    this.token = options.token;
    this.intents = options.intents;
    this.properties = { ...Fingerprint.getProperties(), ...options.properties };
    this.capabilities = options.capabilities ?? 8189;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.emit('debug', 'Already connecting or connected');
      return;
    }

    if (this.heartbeat) {
      this.heartbeat.stop();
      this.heartbeat = null;
    }

    const url = this.resumeUrl || Gateway.URL;
    this.ws = new WebSocket(url);

    this.ws.on('open', () => this.onOpen());
    this.ws.on('message', (data) => this.onMessage(data));
    this.ws.on('close', (code, reason) => this.onClose(code, reason.toString()));
    this.ws.on('error', (error) => this.onError(error));
  }

  private onOpen() {
    this.emit('debug', 'WebSocket opened');
  }

  private onMessage(data: WebSocket.Data) {
    let payload: GatewayPayload;

    try {
      payload = JSON.parse(data.toString());
    } catch {
      this.emit('error', new Error('Failed to parse gateway payload'));
      return;
    }

    if (payload.s !== null && payload.s !== undefined) {
      this.sequence = payload.s;
    }

    switch (payload.op) {
      case Opcodes.DISPATCH:
        this.handleDispatch(payload);
        break;
      case Opcodes.HELLO:
        this.handleHello(payload.d as HelloPayload);
        break;
      case Opcodes.HEARTBEAT_ACK:
        this.heartbeat?.ack();
        break;
      case Opcodes.RECONNECT:
        this.handleReconnect();
        break;
      case Opcodes.INVALID_SESSION:
        this.handleInvalidSession(payload.d as boolean);
        break;
    }
  }

  private handleDispatch(payload: GatewayPayload) {
    const event = payload.t;
    
    if (event === 'READY') {
      const data = payload.d as ReadyPayload;
      this.sessionId = data.session_id;
      this.resumeUrl = data.resume_gateway_url;
      this.emit('ready', data);
    }

    this.emit('dispatch', event, payload.d);
  }

  private handleHello(data: HelloPayload) {
    this.emit('debug', `Heartbeat interval: ${data.heartbeat_interval}ms`);

    this.heartbeat = new Heartbeat(
      this.ws!,
      data.heartbeat_interval,
      () => this.sequence
    );
    this.heartbeat.start();

    if (this.sessionId && this.sequence !== null) {
      this.resume();
    } else {
      this.identify();
    }
  }

  private handleReconnect() {
    this.emit('debug', 'Reconnect requested');
    
    if (this.heartbeat) {
      this.heartbeat.stop();
      this.heartbeat = null;
    }
    
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close(1012, 'Reconnecting');
    }
    
    setTimeout(() => this.connect(), 1000 + Math.random() * 2000);
  }

  private handleInvalidSession(resumable: boolean) {
    this.emit('debug', `Invalid session (resumable: ${resumable})`);

    if (!resumable) {
      this.sessionId = null;
      this.sequence = null;
      this.resumeUrl = null;
    }

    if (this.heartbeat) {
      this.heartbeat.stop();
      this.heartbeat = null;
    }
    
    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Invalid session');
      }
    }

    const delay = 1000 + Math.random() * 4000;
    setTimeout(() => this.connect(), delay);
  }

  private identify() {
    const clientState: ClientState = {
      guild_versions: {},
      api_code_version: 0
    };

    const payload: IdentifyPayload = {
      token: this.token,
      properties: this.properties,
      compress: false,
      capabilities: this.capabilities,
      presence: {
        status: 'unknown',
        since: 0,
        activities: [],
        afk: false
      },
      client_state: clientState
    };

    this.sendPayload(Opcodes.IDENTIFY, payload);
    this.emit('debug', 'Sent identify');
  }

  private resume() {
    if (!this.sessionId || this.sequence === null) {
      this.identify();
      return;
    }

    const payload: ResumePayload = {
      token: this.token,
      session_id: this.sessionId,
      seq: this.sequence
    };

    this.sendPayload(Opcodes.RESUME, payload);
    this.emit('debug', 'Sent resume');
  }

  private sendPayload(op: number, d: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(JSON.stringify({ op, d }));
  }

  send(payload: { op: number; d: any }) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(JSON.stringify(payload));
  }

  private onClose(code: number, reason: string) {
    this.heartbeat?.stop();
    this.heartbeat = null;
    this.emit('debug', `WebSocket closed (${code}: ${reason})`);

    const shouldReconnect = this.shouldReconnect(code);

    if (shouldReconnect) {
      const delay = this.getReconnectDelay(code);
      this.emit('debug', `Reconnecting in ${delay}ms`);
      setTimeout(() => this.connect(), delay);
    } else {
      this.emit('close', code, reason);
    }
  }

  private getReconnectDelay(code: number): number {
    switch (code) {
      case CloseCodes.UNKNOWN_ERROR:
        return 5000;
      case CloseCodes.RATE_LIMITED:
        return 10000;
      default:
        return 1000 + Math.random() * 4000;
    }
  }

  private shouldReconnect(code: number): boolean {
    switch (code) {
      case 1000:
      case 1001:
        return false;
      case CloseCodes.AUTHENTICATION_FAILED:
      case CloseCodes.INVALID_INTENTS:
      case CloseCodes.DISALLOWED_INTENTS:
      case CloseCodes.SHARDING_REQUIRED:
      case CloseCodes.INVALID_API_VERSION:
        return false;
      default:
        return true;
    }
  }

  private onError(error: Error) {
    this.emit('error', error);
  }

  disconnect() {
    if (this.heartbeat) {
      this.heartbeat.stop();
      this.heartbeat = null;
    }
    
    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000);
      }
      this.ws = null;
    }

    this.sequence = null;
    this.sessionId = null;
    this.resumeUrl = null;
  }
}
