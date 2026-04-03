import type { ChannelType } from 'discord.js';

/**
 * All field types Spraxium can render inside a Discord modal.
 *
 * Layout per the Discord API:
 *   ┌ Label (type 18) ────────────────────────────────────┐
 *   │  TextInput (4) | StringSelect (3) | UserSelect (5)  │
 *   │  RoleSelect (6) | MentionableSelect (7)             │
 *   │  ChannelSelect (8) | FileUpload (19)                │
 *   │  RadioGroup (21) | CheckboxGroup (22) | Checkbox(23)│
 *   └─────────────────────────────────────────────────────┘
 *   TextDisplay (10) is top-level (no Label wrapper).
 */
export type ModalFieldType =
  | 'text'
  | 'string_select'
  | 'user_select'
  | 'role_select'
  | 'mentionable_select'
  | 'channel_select'
  | 'radio_group'
  | 'checkbox_group'
  | 'checkbox'
  | 'file_upload'
  | 'text_display';

/** Emoji object for select menu options. Use `'🐛'` for Unicode or `{ id: '123', name: 'custom' }` for custom emoji. */
export interface ModalEmojiObject {
  id?: string;
  name?: string;
  animated?: boolean;
}

/** Accepts a Unicode emoji string `'🐛'` or a full emoji object `{ id, name, animated }`. */
export type ModalEmojiConfig = string | ModalEmojiObject;

/** A selectable choice / option item for select/radio/checkbox fields. */
export interface ModalChoiceItem {
  label: string;
  value: string;
  description?: string;
  default?: boolean;
  emoji?: ModalEmojiConfig;
}

export interface ModalTextFieldDef {
  type: 'text';
  id: string;
  label: string;
  description?: string;
  style?: 'short' | 'paragraph';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  value?: string;
}

export interface ModalStringSelectFieldDef {
  type: 'string_select';
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options: Array<ModalChoiceItem>;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
}

export interface ModalUserSelectFieldDef {
  type: 'user_select';
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
}

export interface ModalRoleSelectFieldDef {
  type: 'role_select';
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
}

export interface ModalMentionableSelectFieldDef {
  type: 'mentionable_select';
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
}

export interface ModalChannelSelectFieldDef {
  type: 'channel_select';
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
  channelTypes?: Array<ChannelType>;
}

export interface ModalRadioGroupFieldDef {
  type: 'radio_group';
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  choices: Array<ModalChoiceItem>;
}

export interface ModalCheckboxGroupFieldDef {
  type: 'checkbox_group';
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  choices: Array<ModalChoiceItem>;
  minValues?: number;
  maxValues?: number;
}

export interface ModalCheckboxFieldDef {
  type: 'checkbox';
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}

export interface ModalFileUploadFieldDef {
  type: 'file_upload';
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  minFiles?: number;
  maxFiles?: number;
}

/** Top-level text display, rendered without a Label wrapper. */
export interface ModalTextDisplayDef {
  type: 'text_display';
  content: string;
}

/** Discriminated union of all modal field definitions. */
export type ModalFieldDef =
  | ModalTextFieldDef
  | ModalStringSelectFieldDef
  | ModalUserSelectFieldDef
  | ModalRoleSelectFieldDef
  | ModalMentionableSelectFieldDef
  | ModalChannelSelectFieldDef
  | ModalRadioGroupFieldDef
  | ModalCheckboxGroupFieldDef
  | ModalCheckboxFieldDef
  | ModalFileUploadFieldDef
  | ModalTextDisplayDef;

export interface ModalTextFieldConfig {
  id?: string;
  label: string;
  description?: string;
  style?: 'short' | 'paragraph';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  value?: string;
}

export interface ModalStringSelectFieldConfig {
  id?: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
}

export interface ModalUserSelectFieldConfig {
  id?: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
}

export interface ModalRoleSelectFieldConfig {
  id?: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
}

export interface ModalMentionableSelectFieldConfig {
  id?: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
}

export interface ModalChannelSelectFieldConfig {
  id?: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
  channelTypes?: Array<ChannelType>;
}

export interface ModalRadioGroupFieldConfig {
  id?: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface ModalCheckboxGroupFieldConfig {
  id?: string;
  label: string;
  description?: string;
  required?: boolean;
  minValues?: number;
  maxValues?: number;
}

export interface ModalCheckboxFieldConfig {
  id?: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}

export interface ModalFileUploadFieldConfig {
  id?: string;
  label: string;
  description?: string;
  required?: boolean;
  minFiles?: number;
  maxFiles?: number;
}

export interface ModalTextDisplayConfig {
  content: string;
}

export interface ModalChoiceConfig {
  label: string;
  value: string;
  description?: string;
  default?: boolean;
  emoji?: ModalEmojiConfig;
}

export interface ModalFieldMetadata {
  propertyKey: string;
  index: number;
  field: ModalFieldDef;
  choices: Array<ModalChoiceItem>;
}
