import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'weather',
  description: 'Returns the current weather (fast response, no defer needed).',
})
export class WeatherCommand {
  build() {}
}
