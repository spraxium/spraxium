import path from 'node:path';
import chalk from 'chalk';
import { type Shard, ShardingManager } from 'discord.js';
import { logger } from '../logger';
import { spraxiumFatal } from '../utils';
import { DEFAULT_SPAWN_DELAY } from './constants';
import type { ShardEvalContext, ShardOptions, ShardStatus } from './interfaces';
import { ParentHookRegistry } from './parent-hook.registry';

export class SpraxiumShardManager {
  private manager: ShardingManager | undefined;

  constructor(
    private readonly options: ShardOptions,
    private readonly token: string,
  ) {}

  public async spawn(startedAt: number): Promise<void> {
    const { totalShards, shardList, respawn = true, spawnDelay = DEFAULT_SPAWN_DELAY } = this.options;

    const manager = new ShardingManager(this.resolveScriptPath(), {
      totalShards,
      shardList,
      respawn,
      token: this.token,
      execArgv: this.buildExecArgv(),
    });

    this.manager = manager;

    const statuses = new Map<number, ShardStatus>();
    const readyPromises: Array<Promise<void>> = [];

    manager.on('shardCreate', (shard: Shard) => {
      statuses.set(shard.id, { ready: false });

      readyPromises.push(
        new Promise<void>((resolve) => {
          shard.once('ready', () => {
            shard
              .eval((c: ShardEvalContext) => c.guilds.cache.size)
              .then((count) => statuses.set(shard.id, { guildCount: count as number, ready: true }))
              .catch(() => statuses.set(shard.id, { ready: true }))
              .finally(() => resolve());
          });
        }),
      );

      shard.on('disconnect', () => logger.warn(`Shard ${shard.id} disconnected`));
      shard.on('reconnecting', () => logger.warn(`Shard ${shard.id} reconnecting`));
      shard.on('death', () => {
        if (respawn) logger.error(`Shard ${shard.id} died , respawning`);
        else logger.error(`Shard ${shard.id} died , respawn disabled`);
      });
    });

    const shardLabel = totalShards === 'auto' ? 'auto' : String(totalShards);
    const plural = totalShards === 1 ? 'shard' : 'shards';
    console.log(
      `  ${chalk.dim('⟳')} ${chalk.cyan('Sharding')}   ${chalk.dim(`spawning ${shardLabel} ${plural}...`)}`,
    );

    try {
      await manager.spawn({ delay: spawnDelay, timeout: -1 });
    } catch (err: unknown) {
      this.handleSpawnError(err, totalShards);
    }

    await Promise.all(readyPromises);
    await ParentHookRegistry.run(manager);

    console.log();
    for (const [shardId, { guildCount, ready }] of [...statuses.entries()].sort(([a], [b]) => a - b)) {
      const detail =
        guildCount !== undefined
          ? `ready (${guildCount} guild${guildCount === 1 ? '' : 's'})`
          : ready
            ? 'ready'
            : 'failed';
      console.log(`  ${chalk.dim('›')} ${chalk.cyan(`Shard ${shardId}`.padEnd(9))}  ${chalk.dim(detail)}`);
    }

    // Collect summary from all shards
    let tag: string | undefined;
    let totalGuilds = 0;
    try {
      const [tags, guilds] = await Promise.all([
        manager.broadcastEval((c) => c.user?.tag),
        manager.broadcastEval((c) => c.guilds.cache.size),
      ]);
      tag = (tags as Array<string | undefined>).find(Boolean);
      totalGuilds = (guilds as Array<number>).reduce((sum, n) => sum + n, 0);
    } catch {
      /* non-fatal */
    }

    const ms = Date.now() - startedAt;
    const count = statuses.size;
    const dot = chalk.gray('  ·  ');

    console.log();
    console.log(
      `  ${[
        `${chalk.bold.cyan('◆')}  ${tag ? chalk.cyan(tag) : chalk.gray('connected')}`,
        chalk.gray(`${count} shard${count === 1 ? '' : 's'}`),
        chalk.gray(`${totalGuilds} total guild${totalGuilds === 1 ? '' : 's'}`),
        chalk.gray(`ready in ${ms}ms`),
      ].join(dot)}`,
    );
    console.log();

    this.registerShutdownHandlers();
  }

  private handleSpawnError(err: unknown, totalShards: ShardOptions['totalShards']): never {
    const response = this.extractResponse(err);
    const status = response?.status;
    const retryAfter = response?.headers?.get?.('retry-after');

    if (status === 429) {
      const retryMsg = retryAfter
        ? `Wait ${retryAfter}s, then restart.`
        : 'Wait a few seconds, then restart.';
      spraxiumFatal(
        'SpraxiumShardManager',
        '429 Too Many Requests',
        [
          'Discord rate-limited the /gateway/bot request used to determine',
          `the recommended shard count${totalShards === 'auto' ? " (required when totalShards is 'auto')" : ''}.`,
        ],
        [
          retryMsg,
          ...(totalShards === 'auto'
            ? ['Switch to a fixed count during dev: sharding: { totalShards: 1 }']
            : []),
        ],
      );
    }

    if (status !== undefined) {
      spraxiumFatal(
        'SpraxiumShardManager',
        `${status} ${response?.statusText ?? 'HTTP Error'}`,
        ['Discord rejected the shard spawn request.'],
        ['Check that the bot token is correct and has not been revoked.'],
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    spraxiumFatal('SpraxiumShardManager', 'unexpected error during spawn', [message]);
  }

  private extractResponse(err: unknown): (Response & { headers: Headers }) | undefined {
    if (err !== null && typeof err === 'object' && 'status' in err && 'statusText' in err) {
      return err as Response & { headers: Headers };
    }
    return undefined;
  }

  private resolveScriptPath(): string {
    const fromRequire = typeof require !== 'undefined' ? require.main?.filename : undefined;
    if (fromRequire) return fromRequire;

    const fromArgv = process.argv[1];
    if (fromArgv) return path.resolve(fromArgv);

    return path.resolve(process.cwd(), 'dist/main.js');
  }

  private buildExecArgv(): Array<string> {
    const argv = [...process.execArgv];
    const scriptPath = this.resolveScriptPath();
    const isTypeScript =
      scriptPath.endsWith('.ts') || scriptPath.endsWith('.mts') || scriptPath.endsWith('.cts');

    if (!isTypeScript) return argv;

    const joined = argv.join(' ');
    if (joined.includes('tsx') || joined.includes('ts-node')) return argv;

    argv.push('--import', 'tsx');
    return argv;
  }

  private registerShutdownHandlers(): void {
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal} , killing all shards`);
      if (this.manager) {
        for (const [, shard] of this.manager.shards) {
          shard.kill();
        }
      }
      process.exit(0);
    };

    process.once('SIGINT', () => void shutdown('SIGINT'));
    process.once('SIGTERM', () => void shutdown('SIGTERM'));

    if (process.platform !== 'win32') {
      process.once('SIGHUP', () => void shutdown('SIGHUP'));
    }
  }
}
