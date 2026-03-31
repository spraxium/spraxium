import 'reflect-metadata';
import type { Server } from 'node:http';
import { serve } from '@hono/node-server';
import { Injectable, Optional } from '@spraxium/common';
import type { SpraxiumOnBoot, SpraxiumOnShutdown } from '@spraxium/common';
import { ConfigStore, Logger, ParentHookRegistry } from '@spraxium/core';
// biome-ignore lint/style/useImportType: runtime reference required for DI reflection
import { Client } from 'discord.js';
import type { ShardingManager } from 'discord.js';
import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { BridgeFactory } from '../bridge';
import { HTTP_MESSAGES } from '../constants';
import { HttpError } from '../errors';
import { GuardExecutor } from '../guards';
import { defineHttp } from '../http.config';
import { HttpRegistry } from './http-registry.service';
import { RouteBuilder } from './route-builder.service';
import { RouteRegistry } from './route-registry.service';

@Injectable()
export class HttpServer implements SpraxiumOnBoot, SpraxiumOnShutdown {
  static {
    ParentHookRegistry.register(async (manager: ShardingManager) => {
      const config = ConfigStore.getPluginConfig(defineHttp);
      if (!config?.sharding || !config.enabled) return;

      HttpRegistry.shardingManager = manager;
      const server = new HttpServer();
      await server.start();

      const shutdown = (): void => {
        void server.onShutdown();
      };
      process.once('SIGINT', shutdown);
      process.once('SIGTERM', shutdown);
    });
  }

  private readonly log = new Logger('HttpServer');
  private server: Server | undefined;

  constructor(@Optional() private readonly client?: Client) {}

  async onBoot(): Promise<void> {
    const config = ConfigStore.getPluginConfig(defineHttp);

    if (!config) {
      this.log.warn(HTTP_MESSAGES.noConfig);
      return;
    }

    if (!config.enabled) return;
    if (config.sharding) return;

    if (!this.client) {
      this.log.error(HTTP_MESSAGES.noClient);
      return;
    }

    await this.start(this.client);
  }

  async start(client?: Client): Promise<void> {
    const config = ConfigStore.getPluginConfig(defineHttp);
    if (!config) return;

    const bridge = BridgeFactory.create(client, HttpRegistry.shardingManager);

    const deps = new Map<unknown, unknown>();
    deps.set('BotBridge', bridge);

    const app = new Hono();

    const globalMiddleware = config.middleware ?? [];
    for (const mw of globalMiddleware) {
      app.use('*', (ctx: Context, next: Next) => mw.handle(ctx, next));
    }

    const globalGuards = config.guards ?? [];
    if (globalGuards.length > 0) {
      const executor = new GuardExecutor(globalGuards);
      app.use('*', async (ctx: Context, next: Next) => {
        const passed = await executor.execute(ctx);
        if (!passed) return;
        await next();
      });
    }

    const controllers = config.controllers ?? [];
    const middlewareProviders = config.middlewareProviders ?? new Map();

    const routeRegistry = new RouteRegistry();
    const controllerEntries = routeRegistry.resolveAll(controllers, deps);
    RouteBuilder.register(app, controllerEntries, middlewareProviders);

    app.onError((err, ctx) => {
      if (err instanceof HttpError) {
        return ctx.json({ ok: false, error: err.message }, err.statusCode as 400 | 401 | 403 | 404 | 500);
      }
      this.log.error(HTTP_MESSAGES.unhandledError(err instanceof Error ? err.message : String(err)));
      return ctx.json({ ok: false, error: 'Internal server error' }, 500);
    });

    this.server = serve({
      fetch: app.fetch.bind(app),
      port: config.port,
      hostname: config.host,
    }) as Server;

    this.log.info(HTTP_MESSAGES.started(config.host, config.port));
  }

  async onShutdown(): Promise<void> {
    if (!this.server) return;
    await new Promise<void>((resolve, reject) => {
      (this.server as Server).close((err) => (err ? reject(err) : resolve()));
    });
    this.log.info(HTTP_MESSAGES.stopped);
  }
}
