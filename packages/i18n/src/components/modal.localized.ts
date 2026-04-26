import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS, ModalRenderer, ModalSchemaBuilder } from '@spraxium/components';
import type {
  ModalChoiceI18nKeys,
  ModalChoiceItem,
  ModalFieldDef,
  ModalFieldI18nKeys,
  ModalI18nKeys,
} from '@spraxium/components';
import type { ModalBuilder } from 'discord.js';
import { resolveChoices, resolveKey } from './utils';

// biome-ignore lint/suspicious/noExplicitAny: generic class constructor
type AnyConstructor = new (...args: Array<any>) => object;

/**
 * Resolves modal i18n keys for the given locale.
 *
 * @example
 * const overrides = resolveModalI18n({ title: 'modals.feedback.title' }, 'pt-BR');
 */
export function resolveModalI18n(keys: ModalI18nKeys, locale: string): { title?: string } {
  return { title: resolveKey(keys.title, locale) };
}

/**
 * Resolves i18n keys on a single modal field definition, returning a copy with
 * translated `label`, `description`, and `placeholder` where translations exist.
 * Also resolves `i18n` on any nested `choices` or `options` arrays.
 *
 * Pass-through for `text_display` fields (no label to override).
 */
export function resolveModalFieldI18n<T extends ModalFieldDef>(field: T, locale: string): T {
  if (field.type === 'text_display') return field;

  const f = field as T & {
    label?: string;
    description?: string;
    placeholder?: string;
    i18n?: ModalFieldI18nKeys;
    choices?: Array<ModalChoiceItem>;
    options?: Array<ModalChoiceItem>;
  };

  const resolved: typeof f = { ...f };

  if (f.i18n) {
    const label = resolveKey(f.i18n.label, locale);
    const description = resolveKey(f.i18n.description, locale);
    const placeholder = resolveKey(f.i18n.placeholder, locale);
    if (label !== undefined) resolved.label = label;
    if (description !== undefined) resolved.description = description;
    if (placeholder !== undefined) resolved.placeholder = placeholder;
  }

  if (Array.isArray(f.choices)) resolved.choices = resolveChoices(f.choices, locale);
  if (Array.isArray(f.options)) resolved.options = resolveChoices(f.options, locale);

  return resolved as T;
}

export interface BuildLocalizedModalOptions {
  /** Class decorated with `@ModalComponent`. */
  modalClass: AnyConstructor;
  /** Discord locale string, e.g. `'pt-BR'`. */
  locale: string;
  /** Runtime data forwarded to `@ModalDynamic` / `@ModalWhen` field factories. */
  // biome-ignore lint/suspicious/noExplicitAny: modal data shape is user-defined
  data?: Record<string, any>;
  /** Pre-filled field values from `ModalFieldCache` (populated on validation failure). */
  cachedValues?: Record<string, string>;
}

/**
 * Builds a Discord modal with i18n keys resolved for the given locale.
 * Resolves the modal title, all field labels/descriptions/placeholders, and
 * choice item labels/descriptions in radio groups, checkbox groups, and string selects.
 *
 * @example
 * const modal = buildLocalizedModal({ modalClass: FeedbackModal, locale });
 * await interaction.showModal(modal);
 *
 * // With dynamic field data or pre-filled cached values:
 * const modal = buildLocalizedModal({ modalClass: EditProfileModal, locale, data: { userId } });
 */
export function buildLocalizedModal({
  modalClass: ModalClass,
  locale,
  data,
  cachedValues,
}: BuildLocalizedModalOptions): ModalBuilder {
  const schema = new ModalSchemaBuilder().build(ModalClass, data, cachedValues);

  const componentMeta = Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.MODAL_COMPONENT, ModalClass) as
    | { title: string; i18n?: ModalI18nKeys }
    | undefined;

  const titleOverride = componentMeta?.i18n?.title ? resolveKey(componentMeta.i18n.title, locale) : undefined;

  const resolvedSchema = {
    ...schema,
    ...(titleOverride !== undefined && { title: titleOverride }),
    fields: schema.fields.map((field: ModalFieldDef) => resolveModalFieldI18n(field, locale)),
  };

  return new ModalRenderer().render(resolvedSchema);
}

export type { ModalI18nKeys, ModalFieldI18nKeys, ModalChoiceI18nKeys };
