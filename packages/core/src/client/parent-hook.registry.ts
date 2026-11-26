import type { ShardingManager } from 'discord.js';
import type { ParentHook } from './types';

export class ParentHookRegistry {
  private static readonly hooks: Set<ParentHook> = new Set();
  private static readonly shutdownHooks = new Set<() => void | Promise<void>>();

  /** Registers cleanup in the shard parent and returns a function that removes it. */
  static onShutdown(hook: () => void | Promise<void>): () => void {
    ParentHookRegistry.shutdownHooks.add(hook);
    return () => ParentHookRegistry.shutdownHooks.delete(hook);
  }

  /** Waits for registered cleanup before the parent stops the shard processes. */
  static async shutdown(): Promise<void> {
    const hooks = [...ParentHookRegistry.shutdownHooks];
    ParentHookRegistry.shutdownHooks.clear();
    await Promise.allSettled(hooks.map(async (hook) => hook()));
  }

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
