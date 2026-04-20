import { PrefixArg, PrefixCommand } from '@spraxium/common';

@PrefixCommand({
  name: 'roll',
  aliases: ['r', 'dice'],
  description: 'Roll one or more dice.',
  category: 'Fun',
  usage: '!roll [sides] [count]',
  cooldown: 3,
})
export class RollCommand {
  @PrefixArg.Integer('sides', { required: false, min: 2, max: 1000 })
  @PrefixArg.Integer('count', { required: false, min: 1, max: 25 })
  build() {}
}
