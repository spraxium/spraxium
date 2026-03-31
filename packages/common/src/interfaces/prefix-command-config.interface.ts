/**
 * Configuration for `@PrefixCommand()` , structure-only declaration.
 *
 * The class decorated with `@PrefixCommand()` acts as a metadata container:
 * it defines the command name, aliases, argument schema, and description.
 * Execution logic belongs in a separate `@PrefixCommandHandler()` class.
 */
export interface PrefixCommandConfig {
  /** Primary trigger name (e.g. `'ban'` for `!ban`). */
  name: string;

  /** Alternative trigger names. */
  aliases?: Array<string>;

  /** Short help text shown in help commands. */
  description?: string;

  /** Override the global prefix for this specific command. */
  prefix?: string;

  /** Usage string shown when arguments are invalid (e.g. `'!ban <user> [reason]'`). */
  usage?: string;

  /** Category for grouping in help output. */
  category?: string;

  /** Per-command cooldown in seconds. Overrides global cooldown. */
  cooldown?: number;
}
