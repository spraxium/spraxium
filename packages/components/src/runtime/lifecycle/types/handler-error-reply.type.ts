import type { Interaction } from 'discord.js';
import type { ModalErrorEmbed } from '../../../components/modal';

/**
 * The resolved value returned by an `onErrorReply` callback or inline value.
 *
 * - `string` — sent as plain text `content`.
 * - `ModalErrorEmbed` — sent as an embed.
 */
export type HandlerErrorResult = string | ModalErrorEmbed;

/**
 * Controls the reply sent to the user when a button or select handler throws.
 *
 * - `string` — always reply with this text.
 * - `ModalErrorEmbed` — always reply with this embed.
 * - `(err, interaction) => string | ModalErrorEmbed` — build the reply from the error.
 */
export type HandlerErrorReply =
  | HandlerErrorResult
  | ((err: unknown, interaction: Interaction) => HandlerErrorResult);
