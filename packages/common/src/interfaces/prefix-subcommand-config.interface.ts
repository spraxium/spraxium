/**
 * Configuration for `@PrefixSubcommand()` , declares a subcommand within
 * a `@PrefixCommand()` class.
 *
 * Each decorated method returns a `PrefixArgDefinition[]` defining the
 * argument schema for that specific subcommand.
 */
export interface PrefixSubcommandConfig {
  /** Subcommand name (matched against the first argv token). */
  name: string;

  /** Short help text shown in help output. */
  description?: string;
}
