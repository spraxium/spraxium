import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { DrizzleDemoCommand } from '../commands/drizzle-demo.command';
import { DrizzlePostgresService } from '../services/drizzle-postgres.service';

@SlashCommandHandler(DrizzleDemoCommand, { sub: 'insert' })
export class DrizzleInsertHandler {
  constructor(private readonly drizzle: DrizzlePostgresService) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('note') note: string,
  ): Promise<void> {
    const row = await this.drizzle.addCheck({
      userId: interaction.user.id,
      guildId: interaction.guildId,
      note,
    });

    const createdAt = row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt);

    await interaction.reply(
      [
        'Registro salvo no PostgreSQL com sucesso.',
        `ID: ${row.id}`,
        `Latency: ${row.latencyMs}ms`,
        `CreatedAt: ${createdAt}`,
      ].join('\n'),
    );
  }
}
