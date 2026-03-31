import type { ShardingManager } from 'discord.js';
import type { ParentHook } from './types';

export class ParentHookRegistry {
  private static readonly hooks: Set<ParentHook> = new Set();

  static register(hook: ParentHook): void {
    ParentHookRegistry.hooks.add(hook);
  }

  static unregister(hook: ParentHook): void {
    ParentHookRegistry.hooks.delete(hook);
  }

  static async run(manager: ShardingManager): Promise<void> {
    for (const hook of ParentHookRegistry.hooks) {
      await hook(manager);
    }
  }
}
