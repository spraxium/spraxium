import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type {
  ModalChannelSelectFieldConfig,
  ModalCheckboxFieldConfig,
  ModalCheckboxGroupFieldConfig,
  ModalChoiceConfig,
  ModalChoiceItem,
  ModalFieldDef,
  ModalFieldMetadata,
  ModalFileUploadFieldConfig,
  ModalMentionableSelectFieldConfig,
  ModalRadioGroupFieldConfig,
  ModalRoleSelectFieldConfig,
  ModalStringSelectFieldConfig,
  ModalTextDisplayConfig,
  ModalTextFieldConfig,
  ModalUserSelectFieldConfig,
} from '../interfaces';

function registerField(target: object, propertyKey: string | symbol, field: ModalFieldDef): void {
  const key = String(propertyKey);
  const list: Array<string> =
    Reflect.getMetadata(COMPONENT_METADATA_KEYS.MODAL_FIELDS_LIST, target.constructor) ?? [];

  const existing: ModalFieldMetadata | undefined = Reflect.getMetadata(
    COMPONENT_METADATA_KEYS.MODAL_FIELD,
    target,
    propertyKey,
  );

  const index = existing?.index ?? list.length;

  if (!existing) {
    list.push(key);
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_FIELDS_LIST, list, target.constructor);
  }

  // Collect any choices that were stored before the field decorator ran.
  // With experimentalDecorators, @ModalChoice/@ModalOption run bottom-to-top
  // BEFORE the field decorator, so choices may already be pending.
  const pendingChoices: Array<ModalChoiceItem> =
    Reflect.getMetadata(COMPONENT_METADATA_KEYS.MODAL_PENDING_CHOICES, target, propertyKey) ?? [];

  const meta: ModalFieldMetadata = {
    propertyKey: key,
    index,
    field,
    choices: [...(existing?.choices ?? []), ...pendingChoices],
  };

  Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_FIELD, meta, target, propertyKey);

  if (pendingChoices.length > 0) {
    Reflect.deleteMetadata(COMPONENT_METADATA_KEYS.MODAL_PENDING_CHOICES, target, propertyKey);
  }
}

function appendChoice(target: object, propertyKey: string | symbol, choice: ModalChoiceItem): void {
  const existing: ModalFieldMetadata | undefined = Reflect.getMetadata(
    COMPONENT_METADATA_KEYS.MODAL_FIELD,
    target,
    propertyKey,
  );

  if (existing) {
    Reflect.defineMetadata(
      COMPONENT_METADATA_KEYS.MODAL_FIELD,
      { ...existing, choices: [choice, ...existing.choices] },
      target,
      propertyKey,
    );
    return;
  }

  // Field decorator hasn't run yet — store choices in a pending key.
  const pending: Array<ModalChoiceItem> =
    Reflect.getMetadata(COMPONENT_METADATA_KEYS.MODAL_PENDING_CHOICES, target, propertyKey) ?? [];
  pending.unshift(choice);
  Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_PENDING_CHOICES, pending, target, propertyKey);
}

/**
 * Single-line or paragraph text input.
 *
 * @example
 * @ModalInput({ label: 'Your feedback', style: 'paragraph', required: true })
 * message!: string;
 */
export function ModalInput(config: ModalTextFieldConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    const id = config.id ?? String(propertyKey);
    registerField(target, propertyKey, {
      type: 'text',
      id,
      label: config.label,
      description: config.description,
      style: config.style,
      required: config.required,
      minLength: config.minLength,
      maxLength: config.maxLength,
      placeholder: config.placeholder,
      value: config.value,
    });
  };
}

/**
 * Drop-down string select. Stack `@ModalOption` below to add options.
 *
 * @example
 * @ModalSelect({ label: 'Plan' })
 * @ModalOption({ label: 'Free', value: 'free' })
 * @ModalOption({ label: 'Pro', value: 'pro' })
 * plan!: string;
 */
export function ModalSelect(config: ModalStringSelectFieldConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    const id = config.id ?? String(propertyKey);
    registerField(target, propertyKey, {
      type: 'string_select',
      id,
      label: config.label,
      description: config.description,
      required: config.required,
      disabled: config.disabled,
      options: [],
      minValues: config.minValues,
      maxValues: config.maxValues,
      placeholder: config.placeholder,
    });
  };
}

/**
 * Auto-populated user select.
 *
 * @example
 * @ModalUserSelect({ label: 'Tag a user' })
 * user!: string;
 */
export function ModalUserSelect(config: ModalUserSelectFieldConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    const id = config.id ?? String(propertyKey);
    registerField(target, propertyKey, {
      type: 'user_select',
      id,
      label: config.label,
      description: config.description,
      required: config.required,
      disabled: config.disabled,
      minValues: config.minValues,
      maxValues: config.maxValues,
      placeholder: config.placeholder,
    });
  };
}

/**
 * Auto-populated role select.
 *
 * @example
 * @ModalRoleSelect({ label: 'Assign role' })
 * role!: string;
 */
export function ModalRoleSelect(config: ModalRoleSelectFieldConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    const id = config.id ?? String(propertyKey);
    registerField(target, propertyKey, {
      type: 'role_select',
      id,
      label: config.label,
      description: config.description,
      required: config.required,
      disabled: config.disabled,
      minValues: config.minValues,
      maxValues: config.maxValues,
      placeholder: config.placeholder,
    });
  };
}

/**
 * Auto-populated mentionable select (users + roles).
 *
 * @example
 * @ModalMentionableSelect({ label: 'Mention', maxValues: 3 })
 * mention!: string;
 */
export function ModalMentionableSelect(config: ModalMentionableSelectFieldConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    const id = config.id ?? String(propertyKey);
    registerField(target, propertyKey, {
      type: 'mentionable_select',
      id,
      label: config.label,
      description: config.description,
      required: config.required,
      disabled: config.disabled,
      minValues: config.minValues,
      maxValues: config.maxValues,
      placeholder: config.placeholder,
    });
  };
}

/**
 * Auto-populated channel select.
 *
 * @example
 * @ModalChannelSelect({ label: 'Channel', channelTypes: [ChannelType.GuildText] })
 * channel!: string;
 */
export function ModalChannelSelect(config: ModalChannelSelectFieldConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    const id = config.id ?? String(propertyKey);
    registerField(target, propertyKey, {
      type: 'channel_select',
      id,
      label: config.label,
      description: config.description,
      required: config.required,
      disabled: config.disabled,
      minValues: config.minValues,
      maxValues: config.maxValues,
      placeholder: config.placeholder,
      channelTypes: config.channelTypes,
    });
  };
}

/**
 * Single-choice radio group. Stack `@ModalChoice` below to add options.
 *
 * @example
 * @ModalRadioGroup({ label: 'Priority' })
 * @ModalChoice({ label: 'Low', value: 'low' })
 * @ModalChoice({ label: 'High', value: 'high' })
 * priority!: string;
 */
export function ModalRadioGroup(config: ModalRadioGroupFieldConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    const id = config.id ?? String(propertyKey);
    registerField(target, propertyKey, {
      type: 'radio_group',
      id,
      label: config.label,
      description: config.description,
      required: config.required,
      choices: [],
    });
  };
}

/**
 * Multi-select checkbox group. Stack `@ModalChoice` below to add options.
 *
 * @example
 * @ModalCheckboxGroup({ label: 'Tags', minValues: 1 })
 * @ModalChoice({ label: 'Bug', value: 'bug' })
 * @ModalChoice({ label: 'Feature', value: 'feature' })
 * tags!: Array<string>;
 */
export function ModalCheckboxGroup(config: ModalCheckboxGroupFieldConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    const id = config.id ?? String(propertyKey);
    registerField(target, propertyKey, {
      type: 'checkbox_group',
      id,
      label: config.label,
      description: config.description,
      required: config.required,
      choices: [],
      minValues: config.minValues,
      maxValues: config.maxValues,
    });
  };
}

/**
 * Single yes/no checkbox.
 *
 * @example
 * @ModalCheckbox({ label: 'I accept the terms of service' })
 * accepted!: boolean;
 */
export function ModalCheckbox(config: ModalCheckboxFieldConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    const id = config.id ?? String(propertyKey);
    registerField(target, propertyKey, {
      type: 'checkbox',
      id,
      label: config.label,
      description: config.description,
      defaultChecked: config.defaultChecked,
    });
  };
}

/**
 * File upload input. Users can attach 1–10 files.
 *
 * @example
 * @ModalFileUpload({ label: 'Attachments', maxFiles: 3 })
 * files!: Array<string>;
 */
export function ModalFileUpload(config: ModalFileUploadFieldConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    const id = config.id ?? String(propertyKey);
    registerField(target, propertyKey, {
      type: 'file_upload',
      id,
      label: config.label,
      description: config.description,
      required: config.required,
      minFiles: config.minFiles,
      maxFiles: config.maxFiles,
    });
  };
}

/**
 * Class decorator — adds a top-level text display (read-only markdown) to the modal.
 * Text displays are rendered before other fields and have no `custom_id`.
 *
 * @example
 * @ModalTextDisplay({ content: 'Please fill in the fields below.' })
 * @ModalComponent({ id: 'onboarding', title: 'Welcome' })
 * export class OnboardingModal { ... }
 */
export function ModalTextDisplay(config: ModalTextDisplayConfig): ClassDecorator {
  return (target): void => {
    const existing: Array<{ content: string }> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.MODAL_TEXT_DISPLAYS, target) ?? [];
    existing.push({ content: config.content });
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_TEXT_DISPLAYS, existing, target);
  };
}

/**
 * Stacks a choice onto a radio group, checkbox group, or string select field.
 * Must be applied below the field decorator (decorators run bottom-to-top).
 *
 * @example
 * @ModalRadioGroupField({ label: 'Plan' })
 * @ModalChoice({ label: 'Free', value: 'free' })
 * @ModalChoice({ label: 'Pro', value: 'pro' })
 * plan!: string;
 */
export function ModalChoice(config: ModalChoiceConfig): PropertyDecorator {
  return (target, propertyKey): void => {
    appendChoice(target, propertyKey, {
      label: config.label,
      value: config.value,
      description: config.description,
      default: config.default,
      emoji: config.emoji,
    });
  };
}

/** Semantic alias for `@ModalChoice` — reads naturally on string select fields. */
export const ModalOption = ModalChoice;
