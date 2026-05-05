import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'wizard',
  description: 'Demo: @FlowContext + @DynamicButton + @ButtonPayload combined.',
})
export class WizardCommand {
  build() {}
}
