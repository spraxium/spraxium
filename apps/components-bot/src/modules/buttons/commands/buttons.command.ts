import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'buttons',
  description: 'Shows all button styles: primary, secondary, success, danger, link, disabled.',
})
export class ButtonsCommand {
  build() {}
}
