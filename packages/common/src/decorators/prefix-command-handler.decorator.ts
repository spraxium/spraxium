import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { PrefixCommandHandlerMetadata } from '../interfaces/prefix-command-handler-metadata.interface';

/**
 * Links a handler class to a `@PrefixCommand()` definition.
 *
 * The handler must expose a `handle()` method which receives injected
 * parameters via `@Ctx()` and `@Arg('name')` decorators.
 *
 * Supports guards via `@UseGuards()` on the class or `handle()` method.
 *
 * Register in a module's `handlers: []` array.
 *
 * @example
 * ```ts
 * // Root handler , handles `!ban <user> [reason]`
 * @PrefixCommandHandler(BanCommand)
 * export class BanHandler {
 *   handle(@Ctx() msg: Message, @PrefixArg('target') user: User) { }
 * }
 *
 * // Subcommand handler , handles `!mod warn <user>`
 * @PrefixCommandHandler(ModCommand, { subcommand: 'warn' })
 * export class ModWarnHandler {
 *   handle(@Ctx() msg: Message, @PrefixArg('target') user: User) { }
 * }
 * ```
 */
export function PrefixCommandHandler(
  command: new () => object,
  options?: { subcommand?: string },
): ClassDecorator {
  return (target) => {
    const meta: PrefixCommandHandlerMetadata = {
      command,
      subcommand: options?.subcommand,
    };
    Reflect.defineMetadata(METADATA_KEYS.PREFIX_COMMAND_HANDLER, meta, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
