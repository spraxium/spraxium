import type { ShardingManager } from 'discord.js';
import type { Constructor } from '../types';
import type { HttpGuard } from './http-guard.interface';
import type { HttpMiddleware } from './http-middleware.interface';

export interface HttpModuleOptions {
  readonly controllers?: Array<Constructor>;
  readonly guards?: Array<HttpGuard>;
  readonly middleware?: Array<HttpMiddleware>;
  readonly middlewareProviders?: Map<Constructor, HttpMiddleware>;
  readonly shardingManager?: ShardingManager;
}
