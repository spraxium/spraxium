import 'reflect-metadata';
import {
  type Constructor,
  type ExecutionContext,
  GuardOption,
  Module,
  type SpraxiumGuard,
  UseGuards,
} from '@spraxium/common';
import type { Client } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { ModuleLoader } from '../src/bootstrap/module.loader';
import { GuardExecutor } from '../src/guards';

const ctx = {} as ExecutionContext;

class AllowList {
  constructor(readonly ids: Array<string>) {}
}

class AllowListGuard implements SpraxiumGuard {
  static constructed = 0;
  constructor(readonly allowList: AllowList) {
    AllowListGuard.constructed++;
  }
  canActivate(): boolean {
    return this.allowList.ids.includes('42');
  }
}

// The test transformer does not emit decorator metadata; declare what tsc would.
Reflect.defineMetadata('design:paramtypes', [AllowList], AllowListGuard);

@UseGuards(AllowListGuard)
class GuardedHandler {
  handle(): void {}
}

/** Boots a module and returns the instances the loader created, keyed by class. */
function boot(module: Constructor, globals: Map<unknown, unknown> = new Map()): Map<unknown, unknown> {
  const instances = new Map<unknown, unknown>();
  const scanner = (instance: unknown): void => {
    instances.set((instance as object).constructor, instance);
  };
  ModuleLoader.instanceScanners.add(scanner);
  try {
    new ModuleLoader().load(module, {} as Client, globals);
  } finally {
    ModuleLoader.instanceScanners.delete(scanner);
  }
  return instances;
}

describe('GuardExecutor DI resolution', () => {
  it('reuses a guard registered as a provider, with its injected application service', async () => {
    @Module({ providers: [AllowListGuard], handlers: [GuardedHandler] })
    class AppModule {}

    const instances = boot(AppModule, new Map([[AllowList, new AllowList(['42'])]]));
    const constructedAtBoot = AllowListGuard.constructed;

    const passed = await GuardExecutor.execute(GuardedHandler, 'handle', ctx, instances.get(GuardedHandler));

    expect(passed).toBe(true);
    expect(AllowListGuard.constructed).toBe(constructedAtBoot);
  });

  it('keeps applications isolated: each handler resolves the guard from its own container', async () => {
    @Module({ providers: [AllowListGuard], handlers: [GuardedHandler] })
    class AllowModule {}
    @Module({ providers: [AllowListGuard], handlers: [GuardedHandler] })
    class DenyModule {}

    const allow = boot(AllowModule, new Map([[AllowList, new AllowList(['42'])]]));
    const deny = boot(DenyModule, new Map([[AllowList, new AllowList(['7'])]]));

    expect(await GuardExecutor.execute(GuardedHandler, 'handle', ctx, allow.get(GuardedHandler))).toBe(true);
    expect(await GuardExecutor.execute(GuardedHandler, 'handle', ctx, deny.get(GuardedHandler))).toBe(false);
  });

  it('falls back to constructing guards that are not registered', async () => {
    class PlainGuard implements SpraxiumGuard {
      canActivate(): boolean {
        return true;
      }
    }
    @UseGuards(PlainGuard)
    class PlainHandler {
      handle(): void {}
    }

    expect(await GuardExecutor.execute(PlainHandler, 'handle', ctx, new PlainHandler())).toBe(true);
    expect(await GuardExecutor.execute(PlainHandler, 'handle', ctx)).toBe(true);
  });

  it('applies per-use options without mutating the registered guard instance', async () => {
    const seen: Array<string> = [];
    class LabelGuard implements SpraxiumGuard {
      @GuardOption({ default: 'none' })
      label!: string;
      canActivate(): boolean {
        seen.push(this.label);
        return true;
      }
    }
    @UseGuards([LabelGuard, { label: 'first' }])
    class FirstHandler {
      handle(): void {}
    }
    @UseGuards(LabelGuard)
    class SecondHandler {
      handle(): void {}
    }
    @Module({ providers: [LabelGuard], handlers: [FirstHandler, SecondHandler] })
    class AppModule {}

    const instances = boot(AppModule);

    await GuardExecutor.execute(FirstHandler, 'handle', ctx, instances.get(FirstHandler));
    await GuardExecutor.execute(SecondHandler, 'handle', ctx, instances.get(SecondHandler));

    expect(seen).toEqual(['first', 'none']);
    expect((instances.get(LabelGuard) as LabelGuard).label).toBeUndefined();
  });
});
