export enum ComponentType {
  ACTION_ROW = 1,
  BUTTON = 2,
  STRING_SELECT = 3,
  TEXT_INPUT = 4,
  USER_SELECT = 5,
  ROLE_SELECT = 6,
  MENTIONABLE_SELECT = 7,
  CHANNEL_SELECT = 8
}

export enum ButtonStyle {
  PRIMARY = 1,
  SECONDARY = 2,
  SUCCESS = 3,
  DANGER = 4,
  LINK = 5
}

export enum TextInputStyle {
  SHORT = 1,
  PARAGRAPH = 2
}

export interface BaseComponent {
  type: ComponentType;
}

export interface ActionRowData extends BaseComponent {
  type: ComponentType.ACTION_ROW;
  components: Array<ButtonData | SelectMenuData | TextInputData>;
}

export interface ButtonData extends BaseComponent {
  type: ComponentType.BUTTON;
  style: ButtonStyle;
  label?: string;
  emoji?: {
    id?: string;
    name?: string;
    animated?: boolean;
  };
  custom_id?: string;
  url?: string;
  disabled?: boolean;
}

export interface SelectMenuData extends BaseComponent {
  type: ComponentType.STRING_SELECT | ComponentType.USER_SELECT | ComponentType.ROLE_SELECT | ComponentType.MENTIONABLE_SELECT | ComponentType.CHANNEL_SELECT;
  custom_id: string;
  options?: Array<{
    label: string;
    value: string;
    description?: string;
    emoji?: {
      id?: string;
      name?: string;
      animated?: boolean;
    };
    default?: boolean;
  }>;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface TextInputData extends BaseComponent {
  type: ComponentType.TEXT_INPUT;
  custom_id: string;
  style: TextInputStyle;
  label: string;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;
}

export type ComponentData = ActionRowData | ButtonData | SelectMenuData | TextInputData;
