import * as pako from 'pako';

export class CompressionHandler {
  private chunks: Buffer[] = [];

  push(data: Buffer, isBinary: boolean): string | null {
    if (!isBinary) {
      return data.toString();
    }

    this.chunks.push(data);

    const length = data.length;
    const flush = length >= 4 &&
      data[length - 4] === 0x00 &&
      data[length - 3] === 0x00 &&
      data[length - 2] === 0xFF &&
      data[length - 1] === 0xFF;

    if (!flush) {
      return null;
    }

    const buffer = Buffer.concat(this.chunks);
    this.chunks = [];

    try {
      const decompressed = pako.inflate(buffer);
      return Buffer.from(decompressed).toString('utf8');
    } catch (error: any) {
      throw new Error(`Decompression error: ${error.message}`);
    }
  }

  reset() {
    this.chunks = [];
  }
}
