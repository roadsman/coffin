import { EmbedData, EmbedFooter, EmbedImage, EmbedAuthor, EmbedField } from '../types/discord/embed';

export class EmbedBuilder {
  private data: EmbedData = {};

  setTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  setURL(url: string): this {
    this.data.url = url;
    return this;
  }

  setColor(color: number): this {
    this.data.color = color;
    return this;
  }

  setTimestamp(timestamp?: Date | number): this {
    this.data.timestamp = timestamp 
      ? new Date(timestamp).toISOString() 
      : new Date().toISOString();
    return this;
  }

  setFooter(footer: EmbedFooter): this {
    this.data.footer = {
      text: footer.text,
      icon_url: footer.iconURL
    };
    return this;
  }

  setImage(image: string | EmbedImage): this {
    const url = typeof image === 'string' ? image : image.url;
    this.data.image = { url };
    return this;
  }

  setThumbnail(thumbnail: string | EmbedImage): this {
    const url = typeof thumbnail === 'string' ? thumbnail : thumbnail.url;
    this.data.thumbnail = { url };
    return this;
  }

  setAuthor(author: EmbedAuthor): this {
    this.data.author = {
      name: author.name,
      url: author.url,
      icon_url: author.iconURL
    };
    return this;
  }

  addField(field: EmbedField): this {
    if (!this.data.fields) {
      this.data.fields = [];
    }
    this.data.fields.push({
      name: field.name,
      value: field.value,
      inline: field.inline
    });
    return this;
  }

  addFields(...fields: EmbedField[]): this {
    for (const field of fields) {
      this.addField(field);
    }
    return this;
  }

  setFields(...fields: EmbedField[]): this {
    this.data.fields = fields.map(f => ({
      name: f.name,
      value: f.value,
      inline: f.inline
    }));
    return this;
  }

  toJSON(): EmbedData {
    return { ...this.data };
  }
}
