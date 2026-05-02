import type { ModalErrorEmbed } from '../../../components/modal';

/**
 * An error message value for context-check failures.
 *
 * - `string`: sent as plain text content.
 * - `() => ModalErrorEmbed`: factory called at reply time; result sent as an embed.
 */
export type ContextErrorMessage = string | (() => ModalErrorEmbed);
