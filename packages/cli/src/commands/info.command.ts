import { ANSI } from '@spraxium/logger';
import type { Command } from 'commander';
import { MessageConstant } from '../constants';
import { BaseCommand } from '../core/base.command';
import type { EnvInfo, InfoReport } from '../interfaces';
import type { InfoCollector } from '../service/info-collector.service';
import type { CliLogger } from '../ui/cli.logger';

export class InfoCommand extends BaseCommand {
  constructor(
    logger: CliLogger,
    private readonly collector: InfoCollector,
  ) {
    super(logger);
  }

  register(program: Command): void {
    program
      .command('info')
      .description('Print environment and Spraxium versions for bug reports')
      .option('--json', 'Output as JSON')
      .action((options: { json?: boolean }) => this.run(() => this.execute(options)));
  }

  private async execute(options: { json?: boolean }): Promise<void> {
    const report = this.collector.collectReport(process.cwd());

    if (options.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    }

    this.printHuman(report);
  }

  private printHuman(report: InfoReport): void {
    this.logger.blank();
    this.logger.star(MessageConstant.INFO_HEADER);
    this.logger.blank();

    this.line('Project', report.projectName);
    this.line('CLI', report.cliVersion);
    this.line('Node', report.env.node);
    this.line('OS', report.env.os);
    this.line('Runtime', report.env.runtime);
    this.line('CWD', report.env.cwd);
    this.line('Package Manager', report.env.packageManager);
    this.logger.blank();
    this.logger.info(MessageConstant.INFO_PM_HEADER);
    this.logger.blank();
    this.printPackageManagers(report.env);
    this.logger.blank();
    this.logger.success(MessageConstant.INFO_FW_HEADER);
    this.logger.blank();
    this.printFrameworkVersions(report.frameworkVersions);
    this.logger.blank();
    this.logger.info(MessageConstant.INFO_TIP);
    this.logger.blank();
  }

  private printPackageManagers(env: EnvInfo): void {
    for (const [name, version] of Object.entries(env.packageManagers)) {
      this.line(name, version);
    }
  }

  private printFrameworkVersions(versions: Record<string, string>): void {
    const entries = Object.entries(versions).sort(([a], [b]) => a.localeCompare(b));
    if (entries.length === 0) {
      this.logger.warn(MessageConstant.INFO_NO_PACKAGES);
      return;
    }
    for (const [pkg, version] of entries) {
      this.line(pkg, version);
    }
  }

  private line(label: string, value: string): void {
    process.stdout.write(`  ${ANSI.gray(label.padEnd(20))}  ${value}\n`);
  }
}
