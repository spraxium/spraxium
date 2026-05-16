import { V2Container, V2Dynamic, V2Text, desc, v2row, v2section, v2sep } from '@spraxium/components';
import { SeparatorSpacingSize } from 'discord.js';
import { Task } from '../task-manager.data';
import { ViewTaskButton } from './ViewTask.button';

@V2Container({ accentColor: '#93ed7a' })
export class TaskListContainer {
  @V2Text(desc().h1('Task List'))
  heading!: never;

  @V2Dynamic((tasks: Task[]) => {
    return tasks.flatMap((task) => {
      return [
        v2section({
          text: task.description,
          dynamic: {
            button: ViewTaskButton,
            item: task,
          },
        }),
        v2sep({ spacing: SeparatorSpacingSize.Large }),
      ];
    });
  })
  tasks!: never;
}
