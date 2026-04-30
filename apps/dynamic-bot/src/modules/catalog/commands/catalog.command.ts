import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'catalog',
  description: 'Demo: dynamic buttons (@DynamicButton + @ButtonPayload).',
})
export class CatalogCommand {}
