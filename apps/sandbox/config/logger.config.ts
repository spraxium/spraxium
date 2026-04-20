import type { SpraxiumLoggerConfig } from '@spraxium/core';

export const loggerConfig: SpraxiumLoggerConfig = {
  maskTokens: true,
  commandLogging: true,
  levels: [
    { name: 'http', color: 'blueBright' },
    { name: 'nathantgm', color: 'magentaBright' },
    { name: 'database', color: 'magentaBright' },
  ],
  discord: {
    type: 'channel',
    webhookUrl: process.env.LOGGER_DISCORD_WEBHOOK_URL,
    levels: ['error', 'warn', 'command', 'nathantgm'],
    channelId: '1462519588775395429',
    embed: {
      description: '{{message}}',
      timestamp: true,
      fields: [
        { name: 'Command', value: '{{command}}', inline: true },
        { name: 'User', value: '{{user}}', inline: true },
        { name: 'Guild', value: '{{guild}}', inline: true },
      ],
    },
  },
};
