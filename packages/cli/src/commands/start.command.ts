import { access } from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
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
      .action(() => this.run(() => this.execute()));
  }

  private async execute(): Promise<void> {
    const cwd = process.cwd();
    const entry = await this.findEntry(cwd);

    if (!entry) {
      throw new Error(MessageConstant.START_NO_ENTRY);
    }

    this.logger.blank();
    console.log(
      `  ${chalk.cyan(UnicodeConstant.STAR)}  ${chalk.cyan.bold(MessageConstant.START_STARTING)} ${chalk.dim(path.relative(cwd, entry))}`,
    );
    this.logger.blank();

    const child = execa(process.execPath, ['--import', swcLoaderHref, entry], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? 'production' },
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
