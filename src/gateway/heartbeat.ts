import WebSocket from 'ws';
import { Opcodes } from '../util/constants';

export class Heartbeat {
  private interval: NodeJS.Timeout | null = null;
  private lastAck: boolean = true;
  private lastBeat: number = 0;
  private lastAckTime: number = 0;
  private missedAcks: number = 0;

  constructor(
    private ws: WebSocket,
    private intervalMs: number,
    private sequence: () => number | null
  ) {}

  start() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.beat();

    this.interval = setInterval(() => {
      this.beat();
    }, this.intervalMs);
  }

  private beat() {
    if (!this.lastAck) {
      this.missedAcks++;

      if (this.missedAcks >= 2) {
        this.ws.close(1008, 'Heartbeat timeout');
        return;
      }
    }

    this.lastAck = false;
    this.lastBeat = Date.now();

    const payload = {
      op: Opcodes.HEARTBEAT,
      d: this.sequence()
    };

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  ack() {
    this.lastAck = true;
    this.lastAckTime = Date.now();
    this.missedAcks = 0;
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.lastAck = true;
    this.missedAcks = 0;
  }

  get ping(): number {
    return this.lastAck && this.lastAckTime > 0 
      ? this.lastAckTime - this.lastBeat 
      : -1;
  }

  get isAlive(): boolean {
    return this.lastAck;
  }
}
