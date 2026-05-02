import { existsSync } from 'node:fs';
import path from 'node:path';
import { checkbox, confirm, input, select } from '@inquirer/prompts';
import { ANSI } from '@spraxium/logger';
import type { Command } from 'commander';
import { MessageConstant, NewCommandConstant } from '../constants';
import { BaseCommand } from '../core/base.command';
import type { PackageManager } from '../interfaces';
import type { ProcessRunner } from '../service/process-runner.service';
import type { ProjectInstaller } from '../service/project-installer.service';
import type { ScaffoldService } from '../service/scaffold.service';
import type { CliLogger } from '../ui/cli.logger';
import { toKebabCase } from '../utils/case.util';
import { resolvePackageManager } from '../utils/package-manager.util';

export class NewCommand extends BaseCommand {
  constructor(
    logger: CliLogger,
    private readonly scaffolder: ScaffoldService,
    private readonly installer: ProjectInstaller,
    private readonly runner: ProcessRunner,
  ) {
    super(logger);
  }

  register(program: Command): void {
    program
      .command('new [name]')
      .alias('n')
      .description('Scaffold a new Spraxium project')
      .action((name?: string) => this.run(() => this.execute(name)));
  }

  private async execute(nameArg?: string): Promise<void> {
    this.logger.blank();
    this.logger.star(MessageConstant.NEW_BANNER);
    this.logger.blank();

    const rawName =
      nameArg ??
      (await input({
        message: MessageConstant.NEW_NAME_PROMPT,
        validate: (v) => v.trim().length > 0 || MessageConstant.NEW_NAME_REQUIRED,
      }));

    const kebabName = toKebabCase(rawName.trim());
    const destDir = path.resolve(process.cwd(), kebabName);

    if (existsSync(destDir)) {
      this.logger.error(MessageConstant.NEW_DIR_EXISTS(kebabName));
      return;
    }

    const template = await select<string>({
      message: MessageConstant.NEW_TEMPLATE_PROMPT,
      choices: NewCommandConstant.TEMPLATES.map((t) => ({ value: t.id, name: t.label })),
    });

    const templateDef =
      NewCommandConstant.TEMPLATES.find((t) => t.id === template) ?? NewCommandConstant.TEMPLATES[0];

    const description = await input({
      message: MessageConstant.NEW_DESCRIPTION_PROMPT,
      default: 'A Spraxium Discord bot',
    });

    const selectedPkgs =
      template === 'default'
        ? await checkbox<string>({
            message: MessageConstant.NEW_EXTRAS_PROMPT,
            choices: NewCommandConstant.EXTRA_PACKAGES.map((e) => ({ value: e.pkg, name: e.label })),
          })
        : templateDef.extraPackages.slice();

    const pm = await resolvePackageManager(this.runner);

    const useGit = await confirm({
      message: MessageConstant.NEW_GIT_PROMPT,
      default: true,
    });

    this.logger.blank();

    const selectedExtras = NewCommandConstant.EXTRA_PACKAGES.filter((e) => selectedPkgs.includes(e.pkg));
    const monorepoRoot = this.installer.detectMonorepoRoot();

    const scaffoldOk = await this.logger.spinner(MessageConstant.NEW_TEMPLATE_DOWNLOADING, async () => {
      try {
        await this.scaffolder.scaffold({
          dir: destDir,
          name: kebabName,
          description,
          template,
          extras: selectedExtras,
          monorepoRoot,
        });
        return { ok: true, output: '' };
      } catch (err) {
        return { ok: false, output: err instanceof Error ? err.message : String(err) };
      }
    });
    this.logger.result(
      scaffoldOk,
      scaffoldOk ? MessageConstant.NEW_FILES_DONE : MessageConstant.NEW_TEMPLATE_FAILED,
    );

    if (!scaffoldOk) return;

    if (useGit) {
      this.logger.step(MessageConstant.NEW_GIT_INIT);
      const ok = await this.runner.silent('git', ['init'], { cwd: destDir });
      if (ok) this.logger.result(true, MessageConstant.NEW_GIT_DONE);
      else this.logger.result(false, MessageConstant.NEW_GIT_FAILED);
    }

    this.logger.blank();

    const allRuntimePkgs = [...NewCommandConstant.CORE_PACKAGES, ...selectedPkgs];
    const runtimeRefs = allRuntimePkgs.map((pkg) => this.installer.resolvePackageRef(monorepoRoot, pkg, pm));
    const runtimeOk = await this.logger.spinner(MessageConstant.NEW_INSTALLING_CORE, () =>
      this.installer.installRuntime(pm, runtimeRefs, destDir),
    );
    this.logger.result(
      runtimeOk,
      runtimeOk ? MessageConstant.NEW_CORE_DONE : MessageConstant.NEW_CORE_FAILED,
    );

    this.logger.blank();
    const devRefs = NewCommandConstant.CLI_DEV_PACKAGES.map((pkg) =>
      this.installer.resolvePackageRef(monorepoRoot, pkg, pm),
    );
    const devOk = await this.logger.spinner(MessageConstant.NEW_INSTALLING_DEV, () =>
      this.installer.installDev(pm, devRefs, destDir),
    );
    this.logger.result(devOk, devOk ? MessageConstant.NEW_DEV_DONE : MessageConstant.NEW_DEV_FAILED);

    this.logger.blank();
    this.printTree(kebabName);
    this.logger.blank();

    if (runtimeOk && devOk) {
      this.printNextSteps(kebabName, pm);
    }
  }

  private printTree(name: string): void {
    console.log(`  ${ANSI.bold('Project structure:')}`);
    console.log();
    console.log(`    ${ANSI.cyan(`${name}/`)}`);
    console.log(`    ${ANSI.dim('├──')} .env`);
    console.log(`    ${ANSI.dim('├──')} .env.example`);
    console.log(`    ${ANSI.dim('├──')} .gitignore`);
    console.log(`    ${ANSI.dim('├──')} package.json`);
    console.log(`    ${ANSI.dim('├──')} spraxium.config.ts`);
    console.log(`    ${ANSI.dim('├──')} tsconfig.json`);
    console.log(`    ${ANSI.dim('└──')} ${ANSI.cyan('src/')}`);
    console.log(`    ${ANSI.dim('    ├──')} app.env.ts`);
    console.log(`    ${ANSI.dim('    ├──')} app.module.ts`);
    console.log(`    ${ANSI.dim('    └──')} main.ts`);
    console.log();
  }

  private printNextSteps(name: string, pm: PackageManager): void {
    const runCmd = pm === 'npm' ? 'npm run' : pm;
    this.logger.info(ANSI.bold('Next steps:'));
    console.log(`    ${ANSI.dim('$')} ${ANSI.cyan(`cd ${name}`)}`);
    console.log(`    ${ANSI.dim('$')} ${ANSI.cyan(`${runCmd} dev`)}`);
    this.logger.blank();
    this.logger.info(`Add your bot token to ${ANSI.yellow('.env')}  →  DISCORD_TOKEN=<token>`);
    this.logger.blank();
    this.logger.star('Spraxium is free and open-source. If it saves you time, consider supporting it.');
    this.logger.info(`Sponsor on Open Collective  →  ${ANSI.cyan('https://opencollective.com/spraxium')}`);
    this.logger.blank();
  }
}
