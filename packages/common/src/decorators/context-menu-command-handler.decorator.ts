import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { ContextMenuCommandHandlerMetadata } from '../interfaces/context-menu-command-handler-metadata.interface';

/**
 * Marks a class as the execution handler for a context menu command.
 *
 * The handler must expose a `handle()` method. Use `@Ctx()` to receive the
 * underlying `UserContextMenuCommandInteraction` or
 * `MessageContextMenuCommandInteraction` from discord.js.
 *
 * @param command The `@ContextMenuCommand`-decorated class this handler responds to.
 *
 * @example
 * @ContextMenuCommandHandler(UserInfoCommand)
 * export class UserInfoHandler {
 *   async handle(@Ctx() interaction: UserContextMenuCommandInteraction) {
 *     await interaction.reply(`User: ${interaction.targetUser.tag}`);
 *   }
 * }
 */
export function ContextMenuCommandHandler(command: new () => object): ClassDecorator {
  return (target) => {
    const meta: ContextMenuCommandHandlerMetadata = { command };
    Reflect.defineMetadata(METADATA_KEYS.CONTEXT_MENU_COMMAND_HANDLER, meta, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
