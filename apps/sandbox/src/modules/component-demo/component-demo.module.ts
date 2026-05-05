import { Module } from '@spraxium/common';
import { ButtonService, EmbedService, SelectService } from '@spraxium/components';
import { ComponentDemoCommand } from './commands/component-demo.command';
import { ButtonsDemoHandler } from './handlers/buttons-demo-command.handler';
import { SelectsDemoHandler } from './handlers/selects-demo-command.handler';
import { TicketPanelHandler } from './handlers/ticket-panel-command.handler';

@Module({
  providers: [EmbedService, SelectService, ButtonService],
  commands: [ComponentDemoCommand],
  handlers: [
    SelectsDemoHandler,
    ButtonsDemoHandler,
    TicketPanelHandler,
  ],
})
export class ComponentDemoModule {}
