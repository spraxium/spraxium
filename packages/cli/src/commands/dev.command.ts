import path from 'node:path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { type ResultPromise, execa } from 'execa';
import { MessageConstant, UnicodeConstant } from '../constants';
import { BaseCommand } from '../core/base.command';
import type { ConfigReader } from '../service/config-reader.service';
import { DevWatcher } from '../service/dev-watcher.service';
import type { ProjectDetector } from '../service/project-detector.service';
import type { CliLogger } from '../ui/cli.logger';

const swcLoaderHref = new URL('./swc.loader.js', import.meta.url).href;

export class DevCommand extends BaseCommand {
  constructor(
    logger: CliLogger,
    private readonly detector: ProjectDetector,
    private readonly configReader: ConfigReader,
  ) {
    super(logger);
  }

  register(program: Command): void {
    program
      .command('dev')
      .description('Start the development server with hot-reload (SWC)')
      .action(() => this.run(() => this.execute()));
  }

  private async execute(): Promise<void> {
    const cwd = process.cwd();
    const main = this.detector.findMainTs(cwd);

    if (!main) {
      throw new Error(MessageConstant.DEV_NO_MAIN);
    }

    const config = await this.configReader.readDevConfig(cwd);
    const entrypoint = config.entrypoint ? path.resolve(cwd, config.entrypoint) : main;

    let child: ResultPromise | null = null;
    let stopping = false;
    let restarting = false;
    let currentDebounceMs = config.debounce ?? 300;
    let restartDebounce: NodeJS.Timeout | null = null;
    let restartPending = '';
    let lastSpawnTime = 0;
    let crashCount = 0;
    const CRASH_THRESHOLD_MS = 2000;
    const MAX_CRASH_BACKOFF_MS = 10000;

    const spawnChild = (restartReason?: string): void => {
      restarting = false;

      if (restartReason) {
        process.stdout.write(UnicodeConstant.CLEAR_SCREEN);
        const label = path.relative(cwd, restartReason);
        console.log(
          `\n  ${chalk.cyan(UnicodeConstant.RESTART)}  ${chalk.cyan(label)}${chalk.gray(' changed, restarting...')}\n`,
        );
        crashCount = 0;
      }

      lastSpawnTime = Date.now();

      child = execa(process.execPath, ['--import', swcLoaderHref, entrypoint], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? 'development' },
      });

      child
        .then(() => {
          if (stopping || restarting) return;
          const lifetime = Date.now() - lastSpawnTime;
          if (lifetime < CRASH_THRESHOLD_MS) {
            crashCount++;
            const backoff = Math.min(1000 * 2 ** crashCount, MAX_CRASH_BACKOFF_MS);
            this.logger.warn(`Process exited too quickly (${lifetime}ms). Retrying in ${backoff}ms…`);
            setTimeout(() => spawnChild(), backoff);
          } else {
            crashCount = 0;
            setTimeout(() => spawnChild(), 500);
          }
        })
        .catch(() => {
          // crashed or killed , watcher will trigger restart
        });
    };

    const killAndRestart = (reason: string): void => {
      if (stopping || restarting) return;
      restarting = true;
      if (child) {
        const prev = child;
        child = null;
        prev.kill('SIGTERM');
        const forceKill = setTimeout(() => prev.kill('SIGKILL'), 3000);
        prev.then(() => clearTimeout(forceKill)).catch(() => clearTimeout(forceKill));
      }
      setTimeout(() => spawnChild(reason), 500);
    };

    const scheduleRestart = (filePath: string): void => {
      if (stopping) return;
      restartPending = path.isAbsolute(filePath) ? filePath : path.resolve(cwd, filePath);
      if (restartDebounce) clearTimeout(restartDebounce);
      restartDebounce = setTimeout(() => {
        restartDebounce = null;
        killAndRestart(restartPending);
      }, currentDebounceMs);
    };

    spawnChild();

    const watcher = new DevWatcher({
      cwd,
      configReader: this.configReader,
      initialConfig: config,
      onChange: (filePath) => scheduleRestart(filePath),
      onConfigUpdate: (nextConfig) => {
        currentDebounceMs = nextConfig.debounce ?? 300;
      },
    });
    watcher.start();

    const shutdown = (signal: NodeJS.Signals): void => {
      stopping = true;
      child?.kill(signal);
      watcher.close();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    await new Promise<void>(() => {});
  }
}
