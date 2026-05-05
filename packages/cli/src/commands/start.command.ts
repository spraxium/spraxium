import { access } from 'node:fs/promises';
import path from 'node:path';
import { ANSI, nativeLog } from '@spraxium/logger';
import type { Command } from 'commander';
import { execa } from 'execa';
import { MessageConstant, UnicodeConstant } from '../constants';
import { BaseCommand } from '../core/base.command';

const swcLoaderHref = new URL('./swc.loader.js', import.meta.url).href;

export class StartCommand extends BaseCommand {
  register(program: Command): void {
    program
      .command('start')
      .description('Start the production build (requires a compiled .spraxium/dist/)')
      .option('--force-unlock', 'Terminate any existing instance of this project before starting')
      .option('--no-lock', 'Skip the project lock check entirely (allows concurrent instances)')
      .action((opts: { forceUnlock?: boolean; lock?: boolean }) => this.run(() => this.execute(opts)));
  }

  private async execute(opts: { forceUnlock?: boolean; lock?: boolean } = {}): Promise<void> {
    const cwd = process.cwd();
    const entry = await this.findEntry(cwd);

    if (!entry) {
      throw new Error(MessageConstant.START_NO_ENTRY);
    }

    this.logger.blank();
    nativeLog(
      `  ${ANSI.cyan(UnicodeConstant.STAR)}  ${ANSI.cyan(ANSI.bold(MessageConstant.START_STARTING))} ${ANSI.dim(path.relative(cwd, entry))}`,
    );
    this.logger.blank();

    const childEnv: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? 'production',
      SPRAXIUM_LAUNCHER_PID: String(process.pid),
    };
    if (opts.forceUnlock) childEnv.SPRAXIUM_FORCE_UNLOCK = '1';
    if (opts.lock === false) childEnv.SPRAXIUM_NO_LOCK = '1';

    const child = execa(process.execPath, ['--import', swcLoaderHref, entry], {
      stdio: 'inherit',
      env: childEnv,
    });

    try {
      await child;
    } catch (err: unknown) {
      const e = err as { exitCode?: number; signal?: string };
      if (e.signal) return;
      if (e.exitCode && e.exitCode > 0) process.exit(e.exitCode);
    }
  }

  private async findEntry(cwd: string): Promise<string | null> {
    const candidates = [
      path.join(cwd, '.spraxium', 'dist', 'src', 'main.mjs'),
      path.join(cwd, '.spraxium', 'dist', 'src', 'main.js'),
      path.join(cwd, '.spraxium', 'dist', 'main.mjs'),
      path.join(cwd, '.spraxium', 'dist', 'main.js'),
      path.join(cwd, 'dist', 'src', 'main.mjs'),
      path.join(cwd, 'dist', 'src', 'main.js'),
      path.join(cwd, 'dist', 'main.mjs'),
      path.join(cwd, 'dist', 'main.js'),
      path.join(cwd, 'build', 'src', 'main.mjs'),
      path.join(cwd, 'build', 'src', 'main.js'),
      path.join(cwd, 'build', 'main.mjs'),
      path.join(cwd, 'build', 'main.js'),
    ];

    for (const c of candidates) {
      try {
        await access(c);
        return c;
      } catch {}
    }
    return null;
  }
}
