export class ETFEncoder {
  private static readonly VERSION = 131;
  private static readonly SMALL_INT = 97;
  private static readonly INT = 98;
  private static readonly FLOAT = 99;
  private static readonly ATOM = 100;
  private static readonly SMALL_TUPLE = 104;
  private static readonly LARGE_TUPLE = 105;
  private static readonly NIL = 106;
  private static readonly STRING = 107;
  private static readonly LIST = 108;
  private static readonly BINARY = 109;
  private static readonly SMALL_BIG = 110;
  private static readonly LARGE_BIG = 111;
  private static readonly MAP = 116;

  static encode(data: any): Buffer {
    const buffer: number[] = [this.VERSION];
    this.encodeTerm(data, buffer);
    return Buffer.from(buffer);
  }

  private static encodeTerm(data: any, buffer: number[]) {
    if (data === null || data === undefined) {
      buffer.push(this.ATOM, 3);
      buffer.push(...Buffer.from('nil'));
    } else if (typeof data === 'boolean') {
      const atom = data ? 'true' : 'false';
      buffer.push(this.ATOM, atom.length);
      buffer.push(...Buffer.from(atom));
    } else if (typeof data === 'number') {
      this.encodeNumber(data, buffer);
    } else if (typeof data === 'string') {
      this.encodeString(data, buffer);
    } else if (Array.isArray(data)) {
      this.encodeArray(data, buffer);
    } else if (typeof data === 'object') {
      this.encodeMap(data, buffer);
    }
  }

  private static encodeNumber(num: number, buffer: number[]) {
    if (Number.isInteger(num) && num >= 0 && num <= 255) {
      buffer.push(this.SMALL_INT, num);
    } else if (Number.isInteger(num) && num >= -2147483648 && num <= 2147483647) {
      buffer.push(this.INT);
      const bytes = new Int32Array([num]);
      const view = new Uint8Array(bytes.buffer);
      buffer.push(view[3], view[2], view[1], view[0]);
    } else {
      const str = num.toString();
      buffer.push(this.FLOAT, str.length);
      buffer.push(...Buffer.from(str.padEnd(31, '\0')));
    }
  }

  private static encodeString(str: string, buffer: number[]) {
    const bytes = Buffer.from(str, 'utf8');
    buffer.push(this.BINARY);
    const len = bytes.length;
    buffer.push((len >> 24) & 0xFF, (len >> 16) & 0xFF, (len >> 8) & 0xFF, len & 0xFF);
    buffer.push(...bytes);
  }

  private static encodeArray(arr: any[], buffer: number[]) {
    if (arr.length === 0) {
      buffer.push(this.NIL);
      return;
    }

    buffer.push(this.LIST);
    const len = arr.length;
    buffer.push((len >> 24) & 0xFF, (len >> 16) & 0xFF, (len >> 8) & 0xFF, len & 0xFF);
    
    for (const item of arr) {
      this.encodeTerm(item, buffer);
    }
    
    buffer.push(this.NIL);
  }

  private static encodeMap(obj: Record<string, any>, buffer: number[]) {
    const keys = Object.keys(obj);
    buffer.push(this.MAP);
    const len = keys.length;
    buffer.push((len >> 24) & 0xFF, (len >> 16) & 0xFF, (len >> 8) & 0xFF, len & 0xFF);
    
    for (const key of keys) {
      this.encodeString(key, buffer);
      this.encodeTerm(obj[key], buffer);
    }
  }
}
