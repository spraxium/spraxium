/**
 * A single validation rule for a modal text field.
 *
 * Use the factory functions (`minWords()`, `emailFormat()`, etc.) to create
 * instances.
 */
export interface ModalValidationRule {
  validate(value: string): true | string;
}

/** A validation failure produced by {@link ModalValidatorRunner}. */
export interface ModalValidationError {
  fieldId: string;
  label: string;
  value: string;
  message: string;
}

/** Plain-object Discord embed passable directly to `interaction.reply({ embeds: [...] })`. */
export interface ModalErrorEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string; icon_url?: string };
}

/** Options for `@ModalValidationConfig()`. */
export interface ModalValidationOptions {
  /** Whether the error reply should be ephemeral. Defaults to `true`. */
  ephemeral?: boolean;
  /** Custom embed factory receiving the list of validation errors. */
  embed?: (errors: Array<ModalValidationError>) => ModalErrorEmbed;
}

/** Options for `@ModalCache()`. */
export interface ModalCacheConfig {
  /** Time-to-live in seconds. */
  ttl: number;
}
