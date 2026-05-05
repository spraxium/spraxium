import { Ctx, SlashCommandHandler, SlashIntegerOption } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { DrizzleDemoCommand } from '../commands/drizzle-demo.command';
import { DrizzlePostgresService } from '../services/drizzle-postgres.service';

@SlashCommandHandler(DrizzleDemoCommand, { sub: 'recent' })
export class DrizzleRecentHandler {
  constructor(private readonly drizzle: DrizzlePostgresService) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashIntegerOption('limit') limit: number | null,
  ): Promise<void> {
    const rows = await this.drizzle.listRecent(limit ?? 5);

    if (rows.length === 0) {
      await interaction.reply('Nenhum registro encontrado. Use /drizzle insert para criar um teste.');
      return;
    }

    const lines = rows.map((row) => {
      const createdAt = row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt);
      return `#${row.id} | ${row.note} | ${row.latencyMs}ms | ${createdAt}`;
    });

    await interaction.reply(['Ultimos registros:', ...lines].join('\n'));
  }
}
