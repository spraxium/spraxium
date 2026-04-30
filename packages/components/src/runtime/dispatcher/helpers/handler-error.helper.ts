import type { Interaction, RepliableInteraction } from 'discord.js';
import type { ModalErrorEmbed } from '../../../components/modal';
import type { ComponentsConfig, HandlerErrorReply } from '../../lifecycle';

function resolveReply(
  reply: HandlerErrorReply | undefined,
  err: unknown,
  interaction: Interaction,
  ephemeral: boolean,
): { content: string; ephemeral: boolean } | { embeds: Array<ModalErrorEmbed>; ephemeral: boolean } {
  const value = typeof reply === 'function' ? reply(err, interaction) : (reply ?? '❌ Something went wrong.');
  if (typeof value === 'string') return { content: value, ephemeral };
  return { embeds: [value], ephemeral };
}

/**
 * Reports a handler-thrown error: invokes the global `onError` hook (defaulting
 * to `console.error`) and replies to the user with the configured message.
 */
export async function reportHandlerError(
  err: unknown,
  interaction: Interaction,
  handlerName: string,
  config: ComponentsConfig | undefined,
  ephemeralErrors: boolean,
  reply: HandlerErrorReply | undefined,
): Promise<void> {
  try {
    if (config?.onError) {
      await config.onError(err, { interaction, handler: handlerName });
    } else {
      console.error(`[Spraxium] Unhandled error in ${handlerName}:`, err);
    }
  } catch (hookErr) {
    console.error('[Spraxium] onError hook itself threw:', hookErr);
  }

  if (!isRepliable(interaction)) return;
  if (interaction.replied || interaction.deferred) return;

  try {
    const replyOptions = resolveReply(reply, err, interaction, ephemeralErrors);
    await interaction.reply(replyOptions);
  } catch (replyErr) {
    console.error('[Spraxium] failed to send error reply:', replyErr);
  }
}

function isRepliable(interaction: Interaction): interaction is RepliableInteraction {
  return 'reply' in interaction && typeof (interaction as RepliableInteraction).reply === 'function';
}
