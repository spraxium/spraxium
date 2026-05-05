/**
 * i18n key mappings for component decorators in `@spraxium/components`.
 *
 * Each field holds a translation key string. At render time, the
 * `@spraxium/i18n` helpers resolve these keys via `LocaleRegistry`
 * and override the static fallback values.
 *
 * @example
 * @Button({
 *   customId: 'confirm',
 *   label: 'Confirm',    // shown when i18n is not configured
 *   style: 'success',
 *   i18n: { label: 'buttons.confirm.label', emoji: 'buttons.confirm.emoji' },
 * })
 * export class ConfirmButton {}
 */

/** i18n keys for `@Button()` and `@LinkButton()`. */
export interface ButtonI18nKeys {
  /** Key whose value overrides the button label. */
  label?: string;
  /** Key whose value overrides the emoji (must resolve to a Unicode string). */
  emoji?: string;
}

/** i18n keys for select menu decorators (`@StringSelect`, `@UserSelect`, etc.). */
export interface SelectI18nKeys {
  /** Key whose value overrides the placeholder text. */
  placeholder?: string;
}

/** i18n keys for `@SelectOption()`. */
export interface SelectOptionI18nKeys {
  /** Key whose value overrides the option label. */
  label?: string;
  /** Key whose value overrides the option description. */
  description?: string;
}

/** i18n keys for `@ModalComponent()`. */
export interface ModalI18nKeys {
  /** Key whose value overrides the modal title. */
  title?: string;
}

/**
 * i18n keys for modal field decorators
 * (`@ModalInput`, `@ModalSelect`, `@ModalUserSelect`, etc.).
 */
export interface ModalFieldI18nKeys {
  /** Key whose value overrides the field label. */
  label?: string;
  /** Key whose value overrides the field description. */
  description?: string;
  /** Key whose value overrides the field placeholder. */
  placeholder?: string;
}

/** i18n keys for `@ModalChoice()` / `@ModalOption()` choice items. */
export interface ModalChoiceI18nKeys {
  /** Key whose value overrides the choice label. */
  label?: string;
  /** Key whose value overrides the choice description. */
  description?: string;
}

/** i18n keys for `@Embed()`: applies to static string fields only. */
export interface EmbedI18nKeys {
  /** Key whose value overrides the embed title. */
  title?: string;
  /** Key whose value overrides the embed description (only when a static string). */
  description?: string;
  /** Key whose value overrides the author name. */
  authorName?: string;
  /** Key whose value overrides the footer text. */
  footerText?: string;
}

/** i18n keys for `@EmbedField()`: applies to static string name/value only. */
export interface EmbedFieldI18nKeys {
  /** Key whose value overrides the field name. */
  name?: string;
  /** Key whose value overrides the field value. */
  value?: string;
}

/** i18n keys for `@V2TextDisplay()`: applies to static string content only. */
export interface V2TextDisplayI18nKeys {
  /** Key whose value overrides the text display content. */
  content?: string;
}

/** i18n keys for `@V2Section()`: applies to static string text only. */
export interface V2SectionI18nKeys {
  /** Key whose value overrides the section text. */
  text?: string;
}
