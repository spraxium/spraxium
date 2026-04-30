import type { Interaction } from 'discord.js';
import type { HandlerErrorReply } from '../../lifecycle/types';
import type { ErrorReplyOptions } from '../types';

/**
 * Resolves a `HandlerErrorReply` value into the options object expected by
 * `interaction.reply()`.
 */
export function resolveHandlerError(
  reply: HandlerErrorReply,
  interaction: Interaction,
  err: unknown,
  ephemeral: boolean,
): ErrorReplyOptions {
  const resolved = typeof reply === 'function' ? reply(err, interaction) : reply;
  if (typeof resolved === 'string') return { content: resolved, ephemeral };
  return { embeds: [resolved], ephemeral };
}
