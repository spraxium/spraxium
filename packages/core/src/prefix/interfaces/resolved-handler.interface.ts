import type { Constructor, PrefixCommandHandlerMetadata } from '@spraxium/common';
import type { ResolvedPrefixCommand } from './resolved-command.interface';

/** A fully resolved handler registration combining class + instance + metadata. */
export interface ResolvedPrefixHandler {
  handlerCtor: Constructor;
  instance: unknown;
  meta: PrefixCommandHandlerMetadata;
  /** Resolved reference to the parent command entry. */
  command: ResolvedPrefixCommand;
}
