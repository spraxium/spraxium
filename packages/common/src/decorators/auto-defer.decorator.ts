import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

export interface AutoDeferOptions {
  /**
   * Whether the deferred reply should be ephemeral (visible only to the user).
   * Defaults to `false`.
   */
  ephemeral?: boolean;

  /**
   * How many milliseconds to wait before automatically deferring the interaction.
   * If the handler responds within this window, Discord will never show "Thinking..."
   * to the user. If the handler takes longer, the framework defers automatically.
   *
   * Discord's hard deadline is 3000 ms, so keep this well below that.
   * Defaults to `2000` ms.
   */
  threshold?: number;
}

/**
 * Automatically defers the interaction **only if** the handler takes longer
 * than `threshold` milliseconds (default 2000 ms) to respond.
 *
 * Unlike `@Defer()`, which always shows "Thinking..." immediately, `@AutoDefer`
 * is transparent for fast handlers -- Discord never shows the loading state.
 *
 * The framework patches `interaction.reply()` so the handler can always call
 * `interaction.reply()` without worrying about whether a defer happened.
 * If the interaction was deferred behind the scenes, the patch transparently
 * routes the call to `interaction.editReply()` instead.
 *
 * @example
 * ```ts
 * @SlashCommandHandler(StatsCommand)
 * @AutoDefer({ ephemeral: true, threshold: 1500 })
 * export class StatsCommandHandler {
 *   async handle(@Ctx() interaction: ChatInputCommandInteraction) {
 *     const data = await this.db.fetchStats(); // may take 0-3 s
 *     await interaction.reply({ embeds: [buildEmbed(data)] }); // always safe
 *   }
 * }
 * ```
 */
export function AutoDefer(options: AutoDeferOptions = {}): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.AUTO_DEFER, options, target);
  };
}
