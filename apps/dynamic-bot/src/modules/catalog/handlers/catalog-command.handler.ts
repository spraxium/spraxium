import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ButtonService } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { CATALOG } from '../catalog.data';
import { CatalogCommand } from '../commands/catalog.command';
import { NextPageButton, PrevPageButton } from '../components/browse-button.component';
import { BuyBookButton } from '../components/buy-book-button.component';

@SlashCommandHandler(CatalogCommand)
export class CatalogCommandHandler {
  constructor(private readonly buttons: ButtonService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const dynamicRows = await this.buttons.buildDynamic(BuyBookButton, CATALOG);

    const browseRow = this.buttons.build([PrevPageButton, NextPageButton], undefined, [
      { label: '◀ Previous page', style: 'secondary' },
      { label: 'Next page ▶', style: 'primary' },
    ]);

    await interaction.reply({
      content: [
        '## 📚 Bookshop',
        '',
        'Pick a title — each "Buy" button is rendered by `@DynamicButton`,',
        'and the underlying `Book` is delivered to the handler through `@ButtonPayload()`.',
      ].join('\n'),
      components: [...dynamicRows, browseRow],
      flags: MessageFlags.Ephemeral,
    });
  }
}
