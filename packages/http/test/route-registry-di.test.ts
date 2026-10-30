import 'reflect-metadata';
import { Global, Inject, Module, Optional, ReadonlyContainer } from '@spraxium/common';
import { ModuleLoader } from '@spraxium/core';
import type { Client } from 'discord.js';
import type { Context } from 'hono';
import { describe, expect, it } from 'vitest';
import type { HttpGuard } from '../src/interfaces';
import { RouteRegistry } from '../src/service/route-registry.service';

class MapContainer extends ReadonlyContainer {
  constructor(private readonly entries: Map<unknown, unknown>) {
    super();
  }
  get<T = unknown>(token: unknown): T | undefined {
    return this.entries.get(token) as T | undefined;
  }
}

describe('RouteRegistry dependency injection', () => {
  it('reuses a global application provider instead of constructing a duplicate, so it is shut down once', async () => {
    let constructed = 0;
    let shutdowns = 0;

    class QueueService {
      constructor() {
        constructed++;
      }
      async onShutdown(): Promise<void> {
        shutdowns++;
      }
    }

    class ReportService {
      constructor(@Inject(QueueService) readonly queue: QueueService) {}
    }

    @Global()
    @Module({ providers: [QueueService] })
    class AppModule {}

    const loader = new ModuleLoader();
    loader.load(AppModule, {} as Client);
    expect(constructed).toBe(1);

    const deps = new Map<unknown, unknown>();
    new RouteRegistry().resolveServices([QueueService, ReportService], deps, loader.getContainer());

    const appInstance = loader.getContainer().get(QueueService);
    expect(constructed).toBe(1);
    expect(deps.get(QueueService)).toBe(appInstance);
    expect((deps.get(ReportService) as ReportService).queue).toBe(appInstance);

    await loader.runShutdownHooks();
    expect(shutdowns).toBe(1);
  });

  it('does not rebuild a service already present in the HTTP dependency map', () => {
    class Existing {}
    const instance = new Existing();
    const deps = new Map<unknown, unknown>([[Existing, instance]]);

    new RouteRegistry().resolveServices([Existing], deps);

    expect(deps.get(Existing)).toBe(instance);
  });

  it('reuses guard instances owned by the container', () => {
    let constructed = 0;
    class TokenGuard implements HttpGuard {
      constructor() {
        constructed++;
      }
      async canActivate(_ctx: Context): Promise<boolean> {
        return true;
      }
    }
    const owned = new TokenGuard();
    const fallback = new MapContainer(new Map([[TokenGuard, owned]]));

    const [guard] = new RouteRegistry().resolveGuards([TokenGuard], new Map(), fallback);

    expect(guard).toBe(owned);
    expect(constructed).toBe(1);
  });

  it('fails when a required constructor dependency cannot be resolved', () => {
    class MissingRepository {}
    class UsersService {
      constructor(@Inject(MissingRepository) readonly repo: MissingRepository) {}
    }

    expect(() => new RouteRegistry().resolveServices([UsersService], new Map())).toThrowError(
      /Cannot resolve "MissingRepository" at constructor parameter index 0 of UsersService/,
    );
  });

  it('leaves @Optional() dependencies undefined when unresolved', () => {
    class Metrics {}
    class AuditService {
      constructor(@Optional() @Inject(Metrics) readonly metrics?: Metrics) {}
    }

    const deps = new Map<unknown, unknown>();
    new RouteRegistry().resolveServices([AuditService], deps);

    expect((deps.get(AuditService) as AuditService).metrics).toBeUndefined();
  });
});
