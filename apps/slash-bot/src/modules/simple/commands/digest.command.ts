import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'digest',
  description: 'Generates a daily digest report (slow response, triggers auto-defer).',
})
export class DigestCommand {
  build() {}
}
