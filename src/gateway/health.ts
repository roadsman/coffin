import { EventEmitter } from 'events';

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  DISCONNECTED = 'disconnected'
}

export interface HealthMetrics {
  status: HealthStatus;
  ping: number;
  lastHeartbeat: number;
  missedHeartbeats: number;
  reconnects: number;
  uptime: number;
  messagesReceived: number;
  messagesSent: number;
}

export class ConnectionHealth extends EventEmitter {
  private status: HealthStatus = HealthStatus.DISCONNECTED;
  private lastHeartbeat: number = 0;
  private missedHeartbeats: number = 0;
  private reconnects: number = 0;
  private connectedAt: number = 0;
  private messagesReceived: number = 0;
  private messagesSent: number = 0;
  private checkInterval: NodeJS.Timeout | null = null;

  start() {
    this.connectedAt = Date.now();
    this.status = HealthStatus.HEALTHY;
    
    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, 30000);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.status = HealthStatus.DISCONNECTED;
  }

  recordHeartbeat(ping: number) {
    this.lastHeartbeat = Date.now();
    this.missedHeartbeats = 0;
    
    if (ping > 500) {
      this.setStatus(HealthStatus.DEGRADED);
    } else {
      this.setStatus(HealthStatus.HEALTHY);
    }
  }

  recordMissedHeartbeat() {
    this.missedHeartbeats++;
    
    if (this.missedHeartbeats >= 2) {
      this.setStatus(HealthStatus.UNHEALTHY);
    } else if (this.missedHeartbeats >= 1) {
      this.setStatus(HealthStatus.DEGRADED);
    }
  }

  recordReconnect() {
    this.reconnects++;
    this.emit('reconnect', this.reconnects);
  }

  recordMessageReceived() {
    this.messagesReceived++;
  }

  recordMessageSent() {
    this.messagesSent++;
  }

  private checkHealth() {
    const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
    
    if (timeSinceLastHeartbeat > 60000) {
      this.setStatus(HealthStatus.UNHEALTHY);
    } else if (timeSinceLastHeartbeat > 45000) {
      this.setStatus(HealthStatus.DEGRADED);
    }

    this.emit('health-check', this.getMetrics());
  }

  private setStatus(newStatus: HealthStatus) {
    if (this.status !== newStatus) {
      const oldStatus = this.status;
      this.status = newStatus;
      this.emit('status-change', { old: oldStatus, new: newStatus });
    }
  }

  getMetrics(): HealthMetrics {
    return {
      status: this.status,
      ping: Date.now() - this.lastHeartbeat,
      lastHeartbeat: this.lastHeartbeat,
      missedHeartbeats: this.missedHeartbeats,
      reconnects: this.reconnects,
      uptime: this.connectedAt ? Date.now() - this.connectedAt : 0,
      messagesReceived: this.messagesReceived,
      messagesSent: this.messagesSent
    };
  }

  get currentStatus(): HealthStatus {
    return this.status;
  }

  get isHealthy(): boolean {
    return this.status === HealthStatus.HEALTHY || this.status === HealthStatus.DEGRADED;
  }
}
