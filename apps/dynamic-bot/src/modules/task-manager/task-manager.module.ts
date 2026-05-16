import { Module } from '@spraxium/common';
import { TaskManagerCommand } from './commands/task-manager.command';
import { TaskManagerHandler } from './handlers/task-manager-command.handler';
import { ViewTaskHandler } from './handlers/view-task.handler';

@Module({
  commands: [TaskManagerCommand],
  handlers: [TaskManagerHandler, ViewTaskHandler],
})
export class TaskManagerModule {}
