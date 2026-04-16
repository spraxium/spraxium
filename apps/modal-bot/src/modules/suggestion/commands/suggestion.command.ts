import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'suggestion',
  description: 'Submit suggestions for the server.',
})
export class SuggestionCommand {
  @SlashSubcommand({
    name: 'submit',
    description: 'Submit a suggestion with dynamic impact ratings.',
  })
  submit() {}
}
