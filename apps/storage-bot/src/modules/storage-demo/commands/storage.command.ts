import { SlashCommand, SlashOption, SlashSubcommand } from '@spraxium/common';

@SlashCommand({ name: 'storage', description: 'Demonstrates the @spraxium/storage-json package.' })
export class StorageCommand {
  @SlashSubcommand({ name: 'status', description: 'Show the persisted document and collection status.' })
  status() {}

  @SlashOption.String('id', {
    description: 'Stable note identifier',
    required: true,
    minLength: 1,
    maxLength: 50,
  })
  @SlashOption.String('content', {
    description: 'Text to persist',
    required: true,
    minLength: 1,
    maxLength: 500,
  })
  @SlashSubcommand({ name: 'save', description: 'Create or update a collection entry.' })
  save() {}

  @SlashOption.String('id', { description: 'Note identifier', required: true, minLength: 1, maxLength: 50 })
  @SlashSubcommand({ name: 'get', description: 'Read a collection entry and increment its read counter.' })
  get() {}

  @SlashOption.String('id', { description: 'Note identifier', required: true, minLength: 1, maxLength: 50 })
  @SlashSubcommand({ name: 'remove', description: 'Delete a collection entry.' })
  remove() {}

  @SlashSubcommand({ name: 'list', description: 'List collection entries.' })
  list() {}

  @SlashSubcommand({ name: 'reset', description: 'Reset the document and clear the collection.' })
  reset() {}
}
