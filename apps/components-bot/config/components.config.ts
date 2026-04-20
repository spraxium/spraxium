import { defineComponents } from '@spraxium/components';
import { Colors } from 'discord.js';

export const componentsConfig = defineComponents({
  context: {
    storage: { type: 'file' },
    defaultTtl: 300,
  },
  button: {
    ephemeralErrors: true,
  },
  select: {
    ephemeralErrors: true,
  },
  errorMessages: {
    expired: () => ({
      color: Colors.Red,
      title: '⏱️ Interaction Expired',
      description: 'This interaction has expired. Please run the command again.',
      footer: { text: 'Contexts expire after inactivity.' },
    }),
    restricted: () => ({
      color: Colors.Orange,
      title: '🔒 Access Denied',
      description: 'This interaction belongs to another user.',
    }),
  },
});
