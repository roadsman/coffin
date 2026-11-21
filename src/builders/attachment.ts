import { AttachmentPayload } from '../types/discord/attachment';
import { readFileSync } from 'fs';

export class AttachmentBuilder {
  private file: Buffer | string;
  private name: string;
  private description?: string;

  constructor(file: Buffer | string, name?: string) {
    if (typeof file === 'string') {
      try {
        this.file = readFileSync(file);
        this.name = name || file.split('/').pop() || file.split('\\').pop() || 'file';
      } catch {
        this.file = file;
        this.name = name || 'file.txt';
      }
    } else {
      this.file = file;
      this.name = name || 'file';
    }
  }

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  setFile(file: Buffer | string): this {
    if (typeof file === 'string') {
      try {
        this.file = readFileSync(file);
      } catch {
        this.file = file;
      }
    } else {
      this.file = file;
    }
    return this;
  }

  toJSON(id: number): AttachmentPayload {
    return {
      id,
      filename: this.name,
      description: this.description
    };
  }

  get data(): Buffer {
    return typeof this.file === 'string' 
      ? Buffer.from(this.file) 
      : this.file;
  }

  get filename(): string {
    return this.name;
  }
}
