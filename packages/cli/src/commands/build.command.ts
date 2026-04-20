import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import { BuildConstant, MessageConstant } from '../constants';
import { BaseCommand } from '../core/base.command';
import type { ProcessRunner } from '../service/process-runner.service';
import type { CliLogger } from '../ui/cli.logger';

export class BuildCommand extends BaseCommand {
  constructor(
    logger: CliLogger,
    private readonly runner: ProcessRunner,
  ) {
    super(logger);
  }

  register(program: Command): void {
    program
      .command('build')
      .description('Type-check and bundle the project with tsdown for production')
      .action(() => this.run(() => this.execute()));
  }

  private async execute(): Promise<void> {
    this.logger.blank();

    const cwd = process.cwd();
    if (!existsSync(path.join(cwd, 'tsconfig.json'))) {
      this.logger.error('No tsconfig.json found. Run this command from the root of a Spraxium project.');
      process.exit(1);
    }

    this.logger.step(MessageConstant.BUILD_TYPE_CHECKING);
    const typeOk = await this.runner.inherit('tsc', ['--noEmit', '--project', 'tsconfig.json']);
    if (!typeOk) {
      this.logger.result(false, MessageConstant.BUILD_TYPE_CHECK_FAILED);
      process.exit(1);
    }
    this.logger.result(true, MessageConstant.BUILD_TYPE_CHECK_PASSED);

    this.logger.step(MessageConstant.BUILD_COMPILING);
    const buildOk = this.hasUserConfig()
      ? await this.runner.silent('tsdown')
      : await this.runner.silent('tsdown', this.defaultArgs());
    if (!buildOk) {
      this.logger.result(false, MessageConstant.BUILD_FAILED);
      process.exit(1);
    }
    this.logger.result(true, MessageConstant.BUILD_COMPLETE);

    this.logger.blank();
  }

  private hasUserConfig(): boolean {
    const cwd = process.cwd();
    return BuildConstant.TSDOWN_CONFIG_FILES.some((name) => existsSync(path.join(cwd, name)));
  }

  private defaultArgs(): Array<string> {
    return [
      'src/main.ts',
      'spraxium.config.ts',
      '--out-dir',
      BuildConstant.DEFAULT_OUT_DIR,
      '--format',
      'esm',
      '--platform',
      'node',
      '--clean',
      '--no-dts',
    ];
  }
}
