import type { ModalSubmitInteraction } from 'discord.js';

/**
 * The interaction context received by a `@ModalHandler()` method.
 *
 * Wraps Discord.js `ModalSubmitInteraction`, exposing the full submission
 * context including field accessors (`fields.getTextInputValue`, etc.).
 */
export type ModalContext = ModalSubmitInteraction;
