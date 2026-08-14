import { MessageFlags } from 'discord.js';
import type { ContextErrorMessage } from '../../lifecycle/types';
import type { ErrorReplyOptions } from '../types';
/**
 * Resolves a `ContextErrorMessage` (plain string or embed factory) into
 * the options object expected by `interaction.reply()`.
 */
export function resolveContextError(
  msg: ContextErrorMessage | undefined,
  fallback: string,
  ephemeral: boolean,
): ErrorReplyOptions {
  const flags = ephemeral ? MessageFlags.Ephemeral : undefined;
  if (!msg || typeof msg === 'string') {
    return { content: msg ?? fallback, flags };
  }
  return { embeds: [msg()], flags };
}
