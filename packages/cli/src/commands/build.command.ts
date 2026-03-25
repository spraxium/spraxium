import fs from 'node:fs';
import chalk from 'chalk';
import type { Command } from 'commander';
import { MessageConstant, UnicodeConstant } from '../constants';
import { BaseCommand } from '../core/base.command';
import type { EsmImportFixer } from '../services/esm-import-fixer';
import type { ProcessRunner } from '../services/process-runner';
import type { CliLogger } from '../ui/cli-logger';

export class BuildCommand extends BaseCommand {
  constructor(
    logger: CliLogger,
    private readonly runner: ProcessRunner,
    private readonly esmFixer: EsmImportFixer,
  ) {
    super(logger);
  }

  register(program: Command): void {
    program
      .command('build')
      .description('Type-check and compile the project with tsc for production')
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
    const outDir = this.esmFixer.resolveOutDir(process.cwd());
    fs.mkdirSync(outDir, { recursive: true });
    const buildOk = await this.runner.inherit('tsc');
    if (!buildOk) {
      this.printResult(false, MessageConstant.BUILD_FAILED);
      process.exit(1);
    }
    this.printResult(true, MessageConstant.BUILD_COMPLETE);

    if (fs.existsSync(outDir)) {
      this.printStep(MessageConstant.BUILD_FIXING_IMPORTS);
      const fixed = this.esmFixer.fix(outDir);
      this.printResult(true, `${MessageConstant.BUILD_FIXED_IMPORTS} ${fixed} files`);
    }

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
