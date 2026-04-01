import { Global, Module } from '@spraxium/common';
import type { ShardingManager } from 'discord.js';
import type { HttpGuard } from './guards';
import type { HttpMiddleware } from './middleware';
import { HttpServer } from './services/http-server.service';
import type { Constructor } from './types';

export interface HttpModuleOptions {
  readonly controllers?: Array<Constructor>;
  readonly guards?: Array<HttpGuard>;
  readonly middleware?: Array<HttpMiddleware>;
  readonly middlewareProviders?: Map<Constructor, HttpMiddleware>;
  readonly shardingManager?: ShardingManager;
}

@Global()
@Module({
  providers: [HttpServer],
  exports: [HttpServer],
})
export class HttpModule {}
