import { Ctx } from '@spraxium/common';
import { ButtonPayload, DynamicButtonHandler } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import type { Book } from '../catalog.data';
import { BuyBookButton } from '../components/buy-book-button.component';

/**
 * Handler for every clicked `BuyBookButton`. The dispatcher resolves the
 * `~p:<id>` suffix on the custom ID, fetches the persisted `Book`, and injects
 * it through the `@ButtonPayload()` decorator.
 */
@DynamicButtonHandler(BuyBookButton)
export class BuyBookButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction, @ButtonPayload() book: Book): Promise<void> {
    await interaction.reply({
      content: `🧾 You bought **${book.title}** by ${book.author} for $${book.price}.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
