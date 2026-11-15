import 'reflect-metadata';
import { Listener, Module } from '@spraxium/common';
import { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ModuleLoader } from '../src/bootstrap/module.loader';

describe('Module instance discovery', () => {
  let loader: ModuleLoader;
  let client: Client;

  beforeEach(() => {
    ModuleLoader.instanceScanners.clear();
    loader = new ModuleLoader();
    client = new Client({ intents: [] });
  });

  afterEach(async () => {
    await loader.runShutdownHooks();
    await client.destroy();
    ModuleLoader.instanceScanners.clear();
  });

  it('replays earlier providers when a plugin registers a scanner later in the import tree', () => {
    const scan = vi.fn();
    class Earlier {}
    class RegisterScanner {
      constructor() {
        ModuleLoader.instanceScanners.add(scan);
      }
    }
    class Later {}
    @Module({ providers: [Earlier] })
    class FeatureModule {}
    @Module({ providers: [RegisterScanner] })
    class PluginModule {}
    @Module({ imports: [FeatureModule, PluginModule], providers: [Later] })
    class AppModule {}
    loader.load(AppModule, client);
    expect(scan.mock.calls).toEqual([
      [expect.any(Earlier), loader],
      [expect.any(RegisterScanner), loader],
      [expect.any(Later), loader],
    ]);
  });

  it('scans each listener instance and invokes its lifecycle hooks', async () => {
    const scan = vi.fn();
    const boot = vi.fn();
    const shutdown = vi.fn();
    ModuleLoader.instanceScanners.add(scan);
    @Listener('clientReady')
    class Tasks {
      onBoot() {
        boot();
      }
      onShutdown() {
        shutdown();
      }
    }
    @Module({ listeners: [Tasks] })
    class AppModule {}
    loader.load(AppModule, client);
    await loader.runBootHooks();
    expect(scan).toHaveBeenCalledExactlyOnceWith(expect.any(Tasks), loader);
    expect(boot).toHaveBeenCalledTimes(1);
    await loader.runShutdownHooks();
    expect(shutdown).toHaveBeenCalledTimes(1);
  });
});
