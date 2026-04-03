import { Colors as DiscordColors } from 'discord.js';

export const Colors = {
  ...DiscordColors,
  Gold: 0xffd700,
  Silver: 0xc0c0c0,
  Bronze: 0xcd7f32,
} as const;

export type ColorName = keyof typeof Colors;
