import { EventEmitter as NodeEmitter } from 'events';

export interface ClientEvents {
  ready: (data: any) => void;
  messageCreate: (message: any) => void;
  messageUpdate: (message: any) => void;
  messageDelete: (message: any) => void;
  guildCreate: (guild: any) => void;
  guildDelete: (guild: any) => void;
  channelCreate: (channel: any) => void;
  channelUpdate: (channel: any) => void;
  channelDelete: (channel: any) => void;
  typingStart: (data: any) => void;
  presenceUpdate: (data: any) => void;
  userUpdate: (user: any) => void;
  relationshipAdd: (relationship: any) => void;
  relationshipRemove: (relationship: any) => void;
  raw: (event: string, data: any) => void;
  debug: (message: string) => void;
  error: (error: Error) => void;
  disconnect: (code: number, reason: string) => void;
}

export class TypedEmitter<T extends Record<string, (...args: any[]) => void>> extends NodeEmitter {
  override on<K extends string & keyof T>(event: K, listener: T[K]): this {
    return super.on(event, listener);
  }

  override once<K extends string & keyof T>(event: K, listener: T[K]): this {
    return super.once(event, listener);
  }

  override emit<K extends string & keyof T>(event: K, ...args: Parameters<T[K]>): boolean {
    return super.emit(event, ...args);
  }

  override off<K extends string & keyof T>(event: K, listener: T[K]): this {
    return super.off(event, listener);
  }

  override removeListener<K extends string & keyof T>(event: K, listener: T[K]): this {
    return super.removeListener(event, listener);
  }

  override removeAllListeners<K extends string & keyof T>(event?: K): this {
    return super.removeAllListeners(event);
  }
}
