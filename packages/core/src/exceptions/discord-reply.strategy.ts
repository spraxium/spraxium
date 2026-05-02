import {
  type BaseInteraction,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type Message,
  MessageFlags,
} from 'discord.js';
import type { ExceptionLayoutPayload } from './interfaces';

export class DiscordReplyStrategy {
  public static async reply(raw: BaseInteraction | Message, payload: ExceptionLayoutPayload): Promise<void> {
    try {
      if (DiscordReplyStrategy.isInteraction(raw)) {
        await DiscordReplyStrategy.replyToInteraction(raw as ChatInputCommandInteraction, payload);
      } else {
        await DiscordReplyStrategy.replyToMessage(raw as Message, payload);
      }
    } catch {
      // Intentionally swallowed , exception reply failures must never cascade.
    }
  }

  private static isInteraction(raw: BaseInteraction | Message): raw is BaseInteraction {
    return 'isChatInputCommand' in raw && typeof (raw as BaseInteraction).id === 'string';
  }

  private static async replyToInteraction(
    interaction: ChatInputCommandInteraction,
    payload: ExceptionLayoutPayload,
  ): Promise<void> {
    // `ephemeral` is a convenience field kept for backwards compat.
    // discord.js deprecated the boolean; we always convert to MessageFlags.
    const ephemeral = payload.ephemeral ?? true;
    const opts: InteractionReplyOptions = {
      content: payload.content,
      embeds: payload.embeds,
      // biome-ignore lint/suspicious/noExplicitAny: discord.js component generic is broad
      components: payload.components as Array<any>,
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    };

    if (interaction.deferred && !interaction.replied) {
      // The interaction was deferred (e.g. @Defer / @AutoDefer) but not yet replied.
      // Replace the "Thinking…" placeholder instead of creating a stray follow-up alongside it.
      await interaction.editReply({
        content: payload.content,
        embeds: payload.embeds,
        // biome-ignore lint/suspicious/noExplicitAny: discord.js component generic is broad
        components: payload.components as Array<any>,
      });
    } else if (interaction.replied) {
      await interaction.followUp(opts);
    } else {
      await interaction.reply(opts);
    }
  }

  private static async replyToMessage(message: Message, payload: ExceptionLayoutPayload): Promise<void> {
    await message.reply({
      content: payload.content,
      embeds: payload.embeds,
      // biome-ignore lint/suspicious/noExplicitAny: discord.js component generic is broad
      components: payload.components as Array<any>,
    });
  }
}
