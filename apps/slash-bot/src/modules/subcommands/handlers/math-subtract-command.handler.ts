import { Ctx, SlashCommandHandler, SlashNumberOption } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { MathCommand } from '../commands/math.command';

@SlashCommandHandler(MathCommand, { sub: 'subtract' })
export class MathSubtractHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashNumberOption('a') a: number,
    @SlashNumberOption('b') b: number,
  ): Promise<void> {
    await interaction.reply(`➖ ${a} − ${b} = **${a - b}**`);
  }
}
