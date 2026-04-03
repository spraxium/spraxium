import chalk from 'chalk';
import type { Command } from 'commander';
import { MessageConstant, UnicodeConstant } from '../constants';
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

    this.printStep(MessageConstant.BUILD_TYPE_CHECKING);
    const typeOk = await this.runner.inherit('tsc', ['--noEmit']);
    if (!typeOk) {
      this.printResult(false, MessageConstant.BUILD_TYPE_CHECK_FAILED);
      process.exit(1);
    }
    this.printResult(true, MessageConstant.BUILD_TYPE_CHECK_PASSED);

    this.printStep(MessageConstant.BUILD_COMPILING);
    const buildOk = await this.runner.silent('tsdown');
    if (!buildOk) {
      this.printResult(false, MessageConstant.BUILD_FAILED);
      process.exit(1);
    }
    this.printResult(true, MessageConstant.BUILD_COMPLETE);

    this.logger.blank();
  }

  private printStep(text: string): void {
    process.stdout.write(`  ${chalk.dim(UnicodeConstant.CIRCLE)}  ${chalk.dim(text)}\r`);
  }

  private printResult(ok: boolean, text: string): void {
    const icon = ok ? chalk.green(UnicodeConstant.CHECK) : chalk.red(UnicodeConstant.CROSS);
    const msg = ok ? chalk.green(text) : chalk.red(text);
    console.log(`  ${icon}  ${msg}          `);
    if (!ok) this.logger.blank();
  }
}
