export class CoffinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CoffinError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DiscordAPIError extends CoffinError {
  code: number;
  status: number;
  method: string;
  path: string;

  constructor(message: string, code: number, status: number, method: string, path: string) {
    super(message);
    this.name = 'DiscordAPIError';
    this.code = code;
    this.status = status;
    this.method = method;
    this.path = path;
  }
}

export class RateLimitError extends CoffinError {
  timeout: number;
  limit: number;
  method: string;
  path: string;
  global: boolean;

  constructor(message: string, timeout: number, limit: number, method: string, path: string, global: boolean = false) {
    super(message);
    this.name = 'RateLimitError';
    this.timeout = timeout;
    this.limit = limit;
    this.method = method;
    this.path = path;
    this.global = global;
  }
}

export class WebSocketError extends CoffinError {
  code: number | null;

  constructor(message: string, code: number | null = null) {
    super(message);
    this.name = 'WebSocketError';
    this.code = code;
  }
}

export class AuthenticationError extends CoffinError {
  constructor(message: string = 'Invalid token provided') {
    super(message);
    this.name = 'AuthenticationError';
  }
}
