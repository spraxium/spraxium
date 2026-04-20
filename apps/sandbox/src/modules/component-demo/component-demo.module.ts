import { Module } from '@spraxium/common';
import { ButtonService, EmbedService, SelectService } from '@spraxium/components';
import { ComponentDemoCommand } from './commands/component-demo.command';
import { ButtonsDemoHandler } from './handlers/buttons-demo.handler';
import { SelectsDemoHandler } from './handlers/selects-demo.handler';
import { TicketPanelHandler } from './handlers/ticket-panel.handler';

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
