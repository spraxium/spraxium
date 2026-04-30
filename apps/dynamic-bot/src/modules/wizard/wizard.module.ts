import { Module } from '@spraxium/common';
import { WizardCommand } from './commands/wizard.command';
import { PickColorButtonHandler } from './handlers/pick-color-button.handler';
import { WizardCommandHandler } from './handlers/wizard-command.handler';

@Module({
  commands: [WizardCommand],
  handlers: [WizardCommandHandler, PickColorButtonHandler],
})
export class WizardModule {}
