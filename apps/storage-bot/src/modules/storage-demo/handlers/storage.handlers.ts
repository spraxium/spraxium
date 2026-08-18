import { Ctx, SlashCommandHandler, SlashStringOption } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { StorageCommand } from '../commands/storage.command';
import { StorageDemoService } from '../services/storage-demo.service';

@SlashCommandHandler(StorageCommand, { sub: 'status' })
export class StorageStatusHandler {
  constructor(private readonly storage: StorageDemoService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const snapshot = await this.storage.snapshot();
    await interaction.reply({
      content: [
        '**Storage document**',
        `Boots: ${snapshot.stats.bootCount}`,
        `Commands: ${snapshot.stats.commandCount}`,
        `Last boot: ${snapshot.stats.lastBootAt ?? 'unknown'}`,
        '',
        `**Collection entries:** ${snapshot.noteCount}`,
      ].join('\n'),
      ephemeral: true,
    });
  }
}

@SlashCommandHandler(StorageCommand, { sub: 'save' })
export class StorageSaveHandler {
  constructor(private readonly storage: StorageDemoService) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashStringOption('id') id: string,
    @SlashStringOption('content') content: string,
  ): Promise<void> {
    const result = await this.storage.saveNote(id, content);
    await interaction.reply({
      content: `${result.created ? 'Created' : 'Updated'} note \`${id}\`.`,
      ephemeral: true,
    });
  }
}

@SlashCommandHandler(StorageCommand, { sub: 'get' })
export class StorageGetHandler {
  constructor(private readonly storage: StorageDemoService) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashStringOption('id') id: string,
  ): Promise<void> {
    const note = await this.storage.readNote(id);
    await interaction.reply({
      content: note ? `**${id}** (${note.reads} read(s))\n${note.content}` : `Note \`${id}\` was not found.`,
      ephemeral: true,
    });
  }
}

@SlashCommandHandler(StorageCommand, { sub: 'remove' })
export class StorageRemoveHandler {
  constructor(private readonly storage: StorageDemoService) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashStringOption('id') id: string,
  ): Promise<void> {
    const removed = await this.storage.removeNote(id);
    await interaction.reply({
      content: removed ? `Removed note \`${id}\`.` : `Note \`${id}\` was not found.`,
      ephemeral: true,
    });
  }
}

@SlashCommandHandler(StorageCommand, { sub: 'list' })
export class StorageListHandler {
  constructor(private readonly storage: StorageDemoService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const notes = await this.storage.listNotes();
    const preview = notes.slice(0, 10).map(([id, note]) => `- \`${id}\`: ${note.content.slice(0, 80)}`);
    await interaction.reply({
      content: preview.length > 0 ? preview.join('\n') : 'The collection is empty.',
      ephemeral: true,
    });
  }
}

@SlashCommandHandler(StorageCommand, { sub: 'reset' })
export class StorageResetHandler {
  constructor(private readonly storage: StorageDemoService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    await this.storage.reset();
    await interaction.reply({ content: 'Document reset and collection cleared.', ephemeral: true });
  }
}
