import type { Command } from 'commander';
import { BaseCommand } from '../core/base.command';
import type { CliLogger } from '../ui/cli.logger';
import type { VersionSwitchPlan } from '../version-switch/interfaces/version-switch-plan.interface';
import type { SpraxiumReleaseRegistry } from '../version-switch/spraxium-release.registry';
import type { VersionSwitchInstaller } from '../version-switch/version-switch.installer';
import { VersionSwitchProject } from '../version-switch/version-switch.project';

export class UseCommand extends BaseCommand {
  constructor(
    logger: CliLogger,
    private readonly releases: SpraxiumReleaseRegistry,
    private readonly installer: VersionSwitchInstaller,
  ) {
    super(logger);
  }

  register(program: Command): void {
    program
      .command('use <version>')
      .description('Switch the project to Spraxium next, stable, or an exact version')
      .option('--dry-run', 'Verify the release and show the changes without installing')
      .action((version: string, options: { dryRun?: boolean }) =>
        this.run(() => this.execute(version, options.dryRun)),
      );
  }

  private async execute(target: string, dryRun = false): Promise<void> {
    const project = VersionSwitchProject.open(process.cwd());
    const dependencies = project.dependencies();
    const version = await this.releases.resolve(target, project.workspaceRoot);
    await this.releases.assertPublished(
      dependencies.map(({ name }) => name),
      version,
      project.workspaceRoot,
    );

    const plan = { project, dependencies, version };
    this.printPlan(target, plan);
    if (dryRun) {
      this.logger.info(`Dry run. Apply with spraxium use ${version}.`);
      return;
    }

    await this.installer.apply(plan);
    this.logger.success(
      `Installed and verified ${dependencies.length} Spraxium packages with ${project.manager}.`,
    );
  }

  private printPlan(target: string, plan: VersionSwitchPlan): void {
    this.logger.info(
      target === plan.version ? `Spraxium ${plan.version}` : `Resolved ${target} → ${plan.version}`,
    );
    for (const { name, current } of plan.dependencies) {
      process.stdout.write(`    ${name.padEnd(26)} ${current} → ${plan.version}\n`);
    }
  }
}
