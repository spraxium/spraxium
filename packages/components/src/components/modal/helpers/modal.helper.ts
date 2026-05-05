import type {
  ModalChannelSelectFieldConfig,
  ModalChannelSelectFieldDef,
  ModalCheckboxFieldConfig,
  ModalCheckboxFieldDef,
  ModalCheckboxGroupFieldConfig,
  ModalCheckboxGroupFieldDef,
  ModalChoiceItem,
  ModalFieldDef,
  ModalFileUploadFieldConfig,
  ModalFileUploadFieldDef,
  ModalMentionableSelectFieldConfig,
  ModalMentionableSelectFieldDef,
  ModalRadioGroupFieldConfig,
  ModalRadioGroupFieldDef,
  ModalRoleSelectFieldConfig,
  ModalRoleSelectFieldDef,
  ModalStringSelectFieldConfig,
  ModalStringSelectFieldDef,
  ModalTextDisplayDef,
  ModalTextFieldConfig,
  ModalTextFieldDef,
  ModalUserSelectFieldConfig,
  ModalUserSelectFieldDef,
} from '../interfaces';

const field = {
  /**
   * Short or paragraph text input.
   *
   * @example
   * Modal.field.text({ id: 'reason', label: 'Reason', style: 'paragraph' })
   */
  text(config: ModalTextFieldConfig & { id: string }): ModalTextFieldDef {
    return { type: 'text', ...config };
  },

  /**
   * Dropdown with pre-defined string options.
   *
   * @example
   * Modal.field.stringSelect({ id: 'topic', label: 'Topic', options: [
   *   Modal.choice('Bug report', 'bug'),
   *   Modal.choice('Feature request', 'feature'),
   * ]})
   */
  stringSelect(
    config: ModalStringSelectFieldConfig & { id: string; options?: Array<ModalChoiceItem> },
  ): ModalStringSelectFieldDef {
    return { type: 'string_select', options: [], ...config };
  },

  userSelect(config: ModalUserSelectFieldConfig & { id: string }): ModalUserSelectFieldDef {
    return { type: 'user_select', ...config };
  },

  roleSelect(config: ModalRoleSelectFieldConfig & { id: string }): ModalRoleSelectFieldDef {
    return { type: 'role_select', ...config };
  },

  mentionableSelect(
    config: ModalMentionableSelectFieldConfig & { id: string },
  ): ModalMentionableSelectFieldDef {
    return { type: 'mentionable_select', ...config };
  },

  channelSelect(config: ModalChannelSelectFieldConfig & { id: string }): ModalChannelSelectFieldDef {
    return { type: 'channel_select', ...config };
  },

  /**
   * Radio button group: single-choice from a list of options.
   *
   * @example
   * Modal.field.radioGroup({ id: 'priority', label: 'Priority', choices: [
   *   Modal.choice('Low', 'low'),
   *   Modal.choice('High', 'high'),
   * ]})
   */
  radioGroup(
    config: ModalRadioGroupFieldConfig & { id: string; choices?: Array<ModalChoiceItem> },
  ): ModalRadioGroupFieldDef {
    return { type: 'radio_group', choices: [], ...config };
  },

  checkboxGroup(
    config: ModalCheckboxGroupFieldConfig & { id: string; choices?: Array<ModalChoiceItem> },
  ): ModalCheckboxGroupFieldDef {
    return { type: 'checkbox_group', choices: [], ...config };
  },

  checkbox(config: ModalCheckboxFieldConfig & { id: string }): ModalCheckboxFieldDef {
    return { type: 'checkbox', ...config };
  },

  fileUpload(config: ModalFileUploadFieldConfig & { id: string }): ModalFileUploadFieldDef {
    return { type: 'file_upload', ...config };
  },

  textDisplay(content: string): ModalTextDisplayDef {
    return { type: 'text_display', content };
  },
};

/**
 * Utility namespace for building modal field definitions programmatically.
 * Primary use is inside `@ModalDynamicFields()` methods.
 *
 * @example
 * return Modal.fields([
 *   Modal.field.text({ id: 'name', label: 'Name' }),
 *   Modal.when(user.isPremium, Modal.field.text({ id: 'vip', label: 'VIP note' })),
 * ]);
 */
export const Modal = {
  field,

  /** Filters out falsy entries from a mixed field array. */
  fields(items: Array<ModalFieldDef | null | undefined | false>): Array<ModalFieldDef> {
    return items.filter((item): item is ModalFieldDef => Boolean(item));
  },

  /** Returns `field` when the condition is truthy, otherwise `null`. */
  when<T extends ModalFieldDef>(condition: unknown, field: T): T | null {
    return condition ? field : null;
  },

  /** Returns `a` when the condition is truthy, `b` otherwise. */
  whenElse<A extends ModalFieldDef, B extends ModalFieldDef>(condition: unknown, a: A, b: B): A | B {
    return condition ? a : b;
  },

  /** Alias for `Modal.when`. */
  optional<T extends ModalFieldDef>(condition: unknown, field: T): T | null {
    return condition ? field : null;
  },

  /**
   * Creates a `ModalChoiceItem` for use with `stringSelect`, `radioGroup`, or `checkboxGroup`.
   *
   * @example
   * Modal.choice('Bug report', 'bug', 'Something is broken')
   */
  choice(label: string, value: string, description?: string): ModalChoiceItem {
    return description ? { label, value, description } : { label, value };
  },
};
