import { nativeError } from '@spraxium/logger';
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
      nativeError(`Unhandled error in ${handlerName}:`, err);
    }
  } catch (hookErr) {
    nativeError('onError hook itself threw:', hookErr);
  }

  if (!isRepliable(interaction)) return;
  if (interaction.replied || interaction.deferred) return;

  try {
    const replyOptions = resolveReply(reply, err, interaction, ephemeralErrors);
    await interaction.reply(replyOptions);
  } catch (replyErr) {
    nativeError('Failed to send error reply:', replyErr);
  }
}

function isRepliable(interaction: Interaction): interaction is RepliableInteraction {
  return 'reply' in interaction && typeof (interaction as RepliableInteraction).reply === 'function';
}
