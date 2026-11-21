import { 
  ActionRowData, 
  ButtonData, 
  SelectMenuData,
  ComponentType,
  ButtonStyle,
  ComponentData
} from '../types/discord/components';

export class ActionRowBuilder {
  private components: Array<ButtonData | SelectMenuData> = [];

  addComponents(...components: Array<ButtonBuilder | SelectMenuBuilder>): this {
    for (const component of components) {
      this.components.push(component.toJSON());
    }
    return this;
  }

  toJSON(): ActionRowData {
    return {
      type: ComponentType.ACTION_ROW,
      components: this.components
    };
  }
}

export class ButtonBuilder {
  private data: Partial<ButtonData> = {
    type: ComponentType.BUTTON,
    style: ButtonStyle.PRIMARY
  };

  setCustomId(customId: string): this {
    this.data.custom_id = customId;
    return this;
  }

  setLabel(label: string): this {
    this.data.label = label;
    return this;
  }

  setStyle(style: ButtonStyle): this {
    this.data.style = style;
    return this;
  }

  setEmoji(emoji: string | { id?: string; name?: string; animated?: boolean }): this {
    if (typeof emoji === 'string') {
      this.data.emoji = { name: emoji };
    } else {
      this.data.emoji = emoji;
    }
    return this;
  }

  setURL(url: string): this {
    this.data.url = url;
    this.data.style = ButtonStyle.LINK;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.data.disabled = disabled;
    return this;
  }

  toJSON(): ButtonData {
    return this.data as ButtonData;
  }
}

export class SelectMenuBuilder {
  private data: Partial<SelectMenuData> = {
    type: ComponentType.STRING_SELECT,
    options: []
  };

  setCustomId(customId: string): this {
    this.data.custom_id = customId;
    return this;
  }

  setPlaceholder(placeholder: string): this {
    this.data.placeholder = placeholder;
    return this;
  }

  setMinValues(minValues: number): this {
    this.data.min_values = minValues;
    return this;
  }

  setMaxValues(maxValues: number): this {
    this.data.max_values = maxValues;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.data.disabled = disabled;
    return this;
  }

  addOption(option: {
    label: string;
    value: string;
    description?: string;
    emoji?: string | { id?: string; name?: string; animated?: boolean };
    default?: boolean;
  }): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    const emoji = typeof option.emoji === 'string' 
      ? { name: option.emoji }
      : option.emoji;

    this.data.options.push({
      label: option.label,
      value: option.value,
      description: option.description,
      emoji,
      default: option.default
    });

    return this;
  }

  addOptions(...options: Array<{
    label: string;
    value: string;
    description?: string;
    emoji?: string | { id?: string; name?: string; animated?: boolean };
    default?: boolean;
  }>): this {
    for (const option of options) {
      this.addOption(option);
    }
    return this;
  }

  toJSON(): SelectMenuData {
    return this.data as SelectMenuData;
  }
}
