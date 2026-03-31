import { ShardingManager } from 'discord.js';

export type ParentHook = (manager: ShardingManager) => Promise<void> | void;