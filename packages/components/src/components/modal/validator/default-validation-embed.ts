import type { ModalErrorEmbed, ModalValidationError } from '../interfaces';

/** Builds the default red embed for modal validation failures. */
export function buildDefaultValidationEmbed(errors: Array<ModalValidationError>): ModalErrorEmbed {
  return {
    title: '❌ Some fields need attention',
    description: errors.map((e) => `• **${e.label}**: ${e.message}`).join('\n'),
    color: 0xed4245,
  };
}
