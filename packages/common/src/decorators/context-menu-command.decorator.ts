import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { ContextMenuCommandConfig } from '../interfaces/context-menu-command-config.interface';

/**
 * Marks a class as a Discord context menu command (User or Message).
 *
 * Context menu commands appear in the `Apps` submenu when a user right-clicks
 * on another user or message. They take no options — Discord passes the
 * targeted user/message directly on the interaction.
 *
 * The decorated class only declares the command schema; pair it with a
 * `@ContextMenuCommandHandler`-decorated class for the execution logic.
 *
 * @example
 * // User context menu — appears on right-click → Apps → "User Info"
 * @ContextMenuCommand({ name: 'User Info', type: 'user' })
 * export class UserInfoCommand {}
 *
 * @example
 * // Message context menu — appears on right-click → Apps → "Quote"
 * @ContextMenuCommand({ name: 'Quote', type: 'message' })
 * export class QuoteCommand {}
 */
export function ContextMenuCommand(config: ContextMenuCommandConfig): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.CONTEXT_MENU_COMMAND, config, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
