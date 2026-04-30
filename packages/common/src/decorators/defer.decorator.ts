import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

export interface DeferOptions {
  /**
   * Whether the deferred reply should be ephemeral (visible only to the user).
   * Defaults to `false`.
   */
  ephemeral?: boolean;
}

/**
 * Automatically defers the interaction before the handler runs, extending the
 * response window from 3 seconds to 15 minutes.
 *
 * Deferral happens **after** guards pass -- preventing a stuck "thinking..."
 * state if a guard denies the interaction.
 *
 * After using `@Defer()`, the handler must use `interaction.editReply()` instead
 * of `interaction.reply()`.
 *
 * @example
 * ```ts
 * @SlashCommandHandler(StatsCommand)
 * @Defer({ ephemeral: true })
 * export class StatsCommandHandler {
 *   async handle(@Ctx() interaction: ChatInputCommandInteraction) {
 *     const data = await this.db.fetchHeavyReport();
 *     await interaction.editReply({ embeds: [buildEmbed(data)] });
 *   }
 * }
 * ```
 */
export function Defer(options: DeferOptions = {}): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.DEFER, options, target);
  };
}
