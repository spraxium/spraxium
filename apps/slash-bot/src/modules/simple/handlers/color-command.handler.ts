import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ColorCommand } from '../commands/color.command';

const HEX: Record<string, Record<number, string>> = {
  red: { 100: '#ffcdd2', 500: '#f44336', 900: '#b71c1c' },
  green: { 100: '#c8e6c9', 500: '#4caf50', 900: '#1b5e20' },
  blue: { 100: '#bbdefb', 500: '#2196f3', 900: '#0d47a1' },
  yellow: { 100: '#fff9c4', 500: '#ffeb3b', 900: '#f57f17' },
  purple: { 100: '#e1bee7', 500: '#9c27b0', 900: '#4a148c' },
};

@SlashCommandHandler(ColorCommand)
export class ColorHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('name') name: string,
    @SlashOpt('shade') shade: number | null,
  ): Promise<void> {
    const level = shade ?? 500;
    const hex = HEX[name]?.[level] ?? '#000000';
    await interaction.reply(`🎨 **${name}** at shade ${level} → \`${hex}\``);
  }
}
