import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'claim',
  description: 'Demo: @PayloadRef(): one-shot reward button that expires after first click.',
})
export class ClaimCommand {}
