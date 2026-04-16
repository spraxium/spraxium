import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { MathCommand } from '../commands/math.command';

@SlashCommandHandler(MathCommand, { sub: 'add' })
export class MathAddHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('a') a: number,
    @SlashOpt('b') b: number,
  ): Promise<void> {
    await interaction.reply(`➕ ${a} + ${b} = **${a + b}**`);
  }
}
