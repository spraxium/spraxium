import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'vip',
  description: 'Opens the VIP member panel. Requires the VIP role.',
})
export class VipCommand {
  build() {}
}
