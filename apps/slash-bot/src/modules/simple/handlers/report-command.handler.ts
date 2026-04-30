import { Ctx, Defer, SlashCommandHandler } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ReportCommand } from '../commands/report.command';

@SlashCommandHandler(ReportCommand)
@Defer({ ephemeral: true })
export class ReportHandler {
  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 4_000));

    await interaction.editReply('📊 Report generated after 4s of heavy processing.');
  }
}
