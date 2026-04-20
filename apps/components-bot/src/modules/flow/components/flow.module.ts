import { Module } from '@spraxium/common';
import { ButtonService, ContextService, SelectService } from '@spraxium/components';
import { FlowCommand } from '../commands/flow.command';
import { FlowCancelButtonHandler } from '../handlers/flow-cancel-button.handler';
import { FlowCategorySelectHandler } from '../handlers/flow-category-select.handler';
import { FlowConfirmButtonHandler } from '../handlers/flow-confirm-button.handler';
import { FlowConfirmCommandHandler } from '../handlers/flow-confirm-command.handler';
import { FlowWizardCancelHandler } from '../handlers/flow-wizard-cancel.handler';
import { FlowWizardCommandHandler } from '../handlers/flow-wizard-command.handler';
import { FlowWizardSubmitHandler } from '../handlers/flow-wizard-submit.handler';

@Module({
  providers: [ButtonService, SelectService, ContextService],
  commands: [FlowCommand],
  handlers: [

    FlowConfirmCommandHandler,
    FlowWizardCommandHandler,

    FlowConfirmButtonHandler,
    FlowCancelButtonHandler,

    FlowCategorySelectHandler,
    FlowWizardSubmitHandler,
    FlowWizardCancelHandler,
  ],
})
export class FlowModule {}
