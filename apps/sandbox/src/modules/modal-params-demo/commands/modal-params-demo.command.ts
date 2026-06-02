import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'modal-params',
  description: 'Demonstrates @ModalParams() and @ModalPayload() on modal handlers',
})
export class ModalParamsDemoCommand {
  @SlashSubcommand({
    name: 'inline',
    description: 'Select a ticket category then submit a form — params via inline encoding',
  })
  inline() {}

  @SlashSubcommand({
    name: 'payload',
    description: 'Select a ticket category then submit a form — payload via store encoding',
  })
  payload() {}
}
