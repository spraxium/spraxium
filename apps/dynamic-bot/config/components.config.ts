import { defineComponents } from '@spraxium/components';
import { Colors } from 'discord.js';

export const componentsConfig = defineComponents({
  context: {
    storage: { type: 'sqlite' },
    defaultTtl: 300,
  },
  button: {
    ephemeralErrors: true,
    onErrorReply: (err) => ({
      color: Colors.Red,
      title: '💥 Button handler crashed',
      description: `\`\`\`${err instanceof Error ? err.message : String(err)}\`\`\``,
      footer: { text: 'Sent by ComponentsConfig.button.onErrorReply' },
    }),
  },
  select: {
    ephemeralErrors: true,
    onErrorReply: '⚠️ Something went wrong while processing your selection.',
  },
  errorMessages: {
    expired: () => ({
      color: Colors.Orange,
      title: '⏱️ Interaction expired',
      description: 'The flow context tied to this interaction is no longer valid.',
    }),
    restricted: () => ({
      color: Colors.Yellow,
      title: '🔒 Not your interaction',
      description: 'Only the user who started this flow can use these components.',
    }),
    payloadExpired: () => ({
      color: Colors.Grey,
      title: '🗑️ Action expired',
      description: 'The payload bound to this button/select has been garbage-collected.',
      footer: { text: 'Sent by errorMessages.payloadExpired' },
    }),
  },
  onError: (err, { interaction, handler }) => {
    console.error(`[dynamic-bot] handler=${handler} user=${interaction.user.id}`, err);
  },
});
