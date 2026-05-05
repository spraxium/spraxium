import { Module } from '@spraxium/common';
import { PanelCommand } from './commands/panel.command';
import { PanelCommandHandler } from './handlers/panel-command.handler';
import { AddCategoryHandler, CategoryButtonHandler, CategorySelectHandler } from './handlers/panel.handlers';

@Module({
  commands: [PanelCommand],
  handlers: [PanelCommandHandler, CategorySelectHandler, CategoryButtonHandler, AddCategoryHandler],
})
export class PanelModule {}
