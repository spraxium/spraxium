import { ButtonRenderConfig, DynamicButton } from '@spraxium/components';
import { Task } from '../task-manager.data';

@DynamicButton({ baseId: 'view-task', encoding: 'inline' })
export class ViewTaskButton {
  static render(task: Task): ButtonRenderConfig {
    return {
      label: 'View',
      style: 'primary',
      emoji: '👁️',
      params: {
        id: task.id,
      },
    };
  }
}
