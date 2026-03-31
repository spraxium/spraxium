import 'reflect-metadata';
import type { Server } from 'node:http';
import { serve } from '@hono/node-server';
// biome-ignore lint/style/useImportType: runtime reference required for DI reflection
import { Injectable, Optional, ReadonlyContainer } from '@spraxium/common';
import type { SpraxiumOnBoot, SpraxiumOnShutdown } from '@spraxium/common';
import { ConfigStore, Logger, ParentHookRegistry } from '@spraxium/core';
import { Client } from 'discord.js';
import type { ShardingManager } from 'discord.js';
import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { BridgeFactory } from '../bridge';
import { HTTP_MESSAGES, HTTP_METADATA_KEYS } from '../constants';
import { HttpError } from '../errors';
import { ValidationError } from '../errors/validation.error';
import { GuardExecutor } from '../guards';
import { defineHttp } from '../http.config';
import { BotBridge } from '../interfaces';
import type { HttpClientModuleMetadata } from '../interfaces';
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

  constructor(
    @Optional() private readonly client?: Client,
    @Optional() private readonly coreContainer?: ReadonlyContainer,
  ) {}

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

    const moduleMeta: HttpClientModuleMetadata = config.module
      ? (Reflect.getOwnMetadata(HTTP_METADATA_KEYS.HTTP_CLIENT_MODULE, config.module) ?? {})
      : {};

    const bridge = BridgeFactory.create(client, HttpRegistry.shardingManager);

    const deps = new Map<unknown, unknown>();
    deps.set(BotBridge, bridge);
    if (client) deps.set(Client, client);

    const app = new Hono();

    const globalMiddleware = moduleMeta.middleware ?? [];
    for (const mw of globalMiddleware) {
      app.use('*', (ctx: Context, next: Next) => mw.handle(ctx, next));
    }

    const globalGuards = moduleMeta.guards ?? [];
    if (globalGuards.length > 0) {
      const executor = new GuardExecutor(globalGuards);
      app.use('*', async (ctx: Context, next: Next) => {
        const passed = await executor.execute(ctx);
        if (!passed) return;
        await next();
      });
    }

    const controllers = moduleMeta.controllers ?? [];
    const services = moduleMeta.services ?? [];
    const middlewareProviders = moduleMeta.middlewareProviders ?? new Map();

    const routeRegistry = new RouteRegistry();
    routeRegistry.resolveServices(services, deps, this.coreContainer);
    const controllerEntries = routeRegistry.resolveAll(controllers, deps, this.coreContainer);
    RouteBuilder.register(app, controllerEntries, middlewareProviders);

    app.notFound((ctx) => {
      return ctx.json({ ok: false, error: 'Not Found' }, 404);
    });

    app.onError((err, ctx) => {
      if (err instanceof ValidationError) {
        return ctx.json({ ok: false, error: err.message, details: err.details }, 400);
      }
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
