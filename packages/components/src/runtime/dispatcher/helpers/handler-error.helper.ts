import type { Interaction, RepliableInteraction } from 'discord.js';
import type { ComponentsConfig, HandlerErrorReply } from '../../lifecycle';
import { resolveContextError } from './context-error.helper';

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
    const message =
      typeof reply === 'function' ? reply(err, interaction) : (reply ?? '❌ Something went wrong.');
    await interaction.reply(resolveContextError(message, '❌ Something went wrong.', ephemeralErrors));
  } catch (replyErr) {
    console.error('[Spraxium] failed to send error reply:', replyErr);
  }
}

function isRepliable(interaction: Interaction): interaction is RepliableInteraction {
  return 'reply' in interaction && typeof (interaction as RepliableInteraction).reply === 'function';
}
