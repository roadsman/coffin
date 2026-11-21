const DISCORD_EPOCH = 1420070400000n;

export class Snowflake {
  static parse(snowflake: string): {
    timestamp: Date;
    workerId: number;
    processId: number;
    increment: number;
  } {
    const id = BigInt(snowflake);
    const timestamp = Number((id >> 22n) + DISCORD_EPOCH);
    const workerId = Number((id & 0x3E0000n) >> 17n);
    const processId = Number((id & 0x1F000n) >> 12n);
    const increment = Number(id & 0xFFFn);

    return {
      timestamp: new Date(timestamp),
      workerId,
      processId,
      increment
    };
  }

  static timestamp(snowflake: string): number {
    return Number((BigInt(snowflake) >> 22n) + DISCORD_EPOCH);
  }

  static timestampDate(snowflake: string): Date {
    return new Date(Snowflake.timestamp(snowflake));
  }

  static generate(timestamp: number = Date.now()): string {
    const diff = BigInt(timestamp) - DISCORD_EPOCH;
    return (diff << 22n).toString();
  }

  static deconstruct(snowflake: string): string {
    const parsed = Snowflake.parse(snowflake);
    return [
      `Timestamp: ${parsed.timestamp.toISOString()}`,
      `Worker ID: ${parsed.workerId}`,
      `Process ID: ${parsed.processId}`,
      `Increment: ${parsed.increment}`,
      `Binary: ${BigInt(snowflake).toString(2).padStart(64, '0')}`
    ].join('\n');
  }

  static compare(a: string, b: string): number {
    const aBig = BigInt(a);
    const bBig = BigInt(b);
    if (aBig < bBig) return -1;
    if (aBig > bBig) return 1;
    return 0;
  }
}
