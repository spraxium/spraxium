/**
 * Metadata stored by `@PrefixCommandHandler()`.
 *
 * Links a handler class (which contains the `handle()` method) to the
 * `@PrefixCommand()` class it handles.
 */
export interface PrefixCommandHandlerMetadata {
  /** Reference to the `@PrefixCommand()` class this handler processes. */
  command: new () => object;

  /** If set, this handler only fires for `!cmd <subcommand>`. */
  subcommand?: string;
}
