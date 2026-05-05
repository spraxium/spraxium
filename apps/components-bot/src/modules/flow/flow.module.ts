import { Module } from '@spraxium/common';
import { ButtonService, ContextService, SelectService } from '@spraxium/components';
import { FlowCommand } from './commands/flow.command';
import { FlowCancelButtonCommandHandler } from './handlers/flow-cancel-button-command.handler';
import { FlowCategorySelectCommandHandler } from './handlers/flow-category-select-command.handler';
import { FlowConfirmButtonCommandHandler } from './handlers/flow-confirm-button-command.handler';
import { FlowConfirmCommandHandler } from './handlers/flow-confirm-command.handler';
import { FlowWizardCancelCommandHandler } from './handlers/flow-wizard-cancel-command.handler';
import { FlowWizardCommandHandler } from './handlers/flow-wizard-command.handler';
import { FlowWizardSubmitCommandHandler } from './handlers/flow-wizard-submit-command.handler';

@Module({
  providers: [ButtonService, SelectService, ContextService],
  commands: [FlowCommand],
  handlers: [
    FlowConfirmCommandHandler,
    FlowWizardCommandHandler,

    FlowConfirmButtonCommandHandler,
    FlowCancelButtonCommandHandler,

    FlowCategorySelectCommandHandler,
    FlowWizardSubmitCommandHandler,
    FlowWizardCancelCommandHandler,
  ],
})
export class FlowModule {}
