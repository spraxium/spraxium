import path from 'node:path';
import { confirm, input, select } from '@inquirer/prompts';
import { ANSI } from '@spraxium/logger';
import type { Command } from 'commander';
import { type ParseEntry, parse as parseShellArgs } from 'shell-quote';
import { MessageConstant, UnicodeConstant } from '../constants';

const SAFE_POST_INSTALL_BINS = new Set(['npm', 'npx', 'pnpm', 'pnpx', 'yarn', 'bun']);
import { BaseCommand } from '../core/base.command';
import type { DbEntry, OrmEntry } from '../interfaces';
import type { DatabaseTemplateService } from '../service/database-template.service';
import type { FileSystem } from '../service/file-system.service';
import type { ModuleRegistrar } from '../service/module-registrar.service';
import type { ProcessRunner } from '../service/process-runner.service';
import type { ProjectDetector } from '../service/project-detector.service';
import type { ProjectInstaller } from '../service/project-installer.service';
import type { CliLogger } from '../ui/cli.logger';
import { toKebabCase, toPascalCase } from '../utils/case.util';
import { resolvePackageManager } from '../utils/package-manager.util';
import { buildRelativeImport } from '../utils/path.util';

export class DatabaseCommand extends BaseCommand {
  constructor(
    logger: CliLogger,
    private readonly detector: ProjectDetector,
    private readonly fs: FileSystem,
    private readonly installer: ProjectInstaller,
    private readonly runner: ProcessRunner,
    private readonly registrar: ModuleRegistrar,
    private readonly templateService: DatabaseTemplateService,
  ) {
    super(logger);
  }

  register(program: Command): void {
    program
      .command('database [orm]')
      .alias('db')
      .description(
        'Generate a complete database integration module (prisma, drizzle, typeorm, mongoose, mikro-orm)',
      )
      .action((orm?: string) => this.run(() => this.execute(orm)));
  }

  private async execute(ormArg?: string): Promise<void> {
    this.logger.blank();
    this.logger.star(MessageConstant.DB_BANNER);
    this.logger.blank();

    const monorepoRoot = this.installer.detectMonorepoRoot();

    let orms: ReadonlyArray<OrmEntry>;
    try {
      orms = await this.templateService.loadIndex(monorepoRoot);
    } catch (err) {
      this.logger.error(`Failed to load ORM index: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }

    const ormDef = await this.resolveOrm(ormArg, orms);

    const dbEntry = await this.resolveDatabase(ormDef);
    const db = dbEntry.id;

    const rawName = await input({
      message: MessageConstant.DB_MODULE_NAME_PROMPT,
      default: 'database',
      validate: (v) => (v.trim().length > 0 ? true : 'Module name is required'),
    });

    const moduleName = toKebabCase(rawName.trim() || 'database');
    const pascalName = toPascalCase(moduleName);

    const srcDir = this.detector.findSrcDir();
    if (!srcDir) {
      this.logger.error(MessageConstant.NO_SRC_DIR);
      return;
    }

    const moduleDir = path.join(srcDir, 'modules', moduleName);
    if (await this.fs.exists(moduleDir)) {
      const overwrite = await confirm({
        message: MessageConstant.DB_MODULE_EXISTS(moduleName),
        default: false,
      });
      if (!overwrite) {
        this.logger.info(MessageConstant.ABORTED);
        return;
      }
    }

    this.logger.blank();

    const ok = await this.logger.spinner(MessageConstant.DB_DOWNLOADING, async () => {
      try {
        await this.templateService.install({
          orm: ormDef.id,
          db,
          moduleName,
          pascalName,
          srcDir,
          projectRoot: process.cwd(),
          monorepoRoot,
        });
        return { ok: true, output: '' };
      } catch (err) {
        return { ok: false, output: err instanceof Error ? err.message : String(err) };
      }
    });
    this.logger.result(ok, ok ? MessageConstant.DB_FILES_DONE : MessageConstant.DB_FILES_FAILED);

    if (!ok) return;

    const patched = await this.templateService.patchAppEnv(srcDir, dbEntry.envKeys);
    if (patched) {
      const keyList = dbEntry.envKeys.map((k) => k.key).join(', ');
      this.logger.success(MessageConstant.DB_ENV_PATCHED(keyList));
    } else {
      this.logger.info(MessageConstant.DB_ENV_ALREADY_SET);
    }

    const shouldInstall = await confirm({
      message: MessageConstant.DB_INSTALL_PROMPT,
      default: true,
    });

    if (shouldInstall) {
      const pm = await resolvePackageManager(this.runner);

      const runtimePkgs = dbEntry.runtimePackages;
      if (runtimePkgs.length > 0) {
        const runtimeOk = await this.logger.spinner(MessageConstant.NEW_INSTALLING_CORE, () =>
          this.installer.installRuntime(pm, runtimePkgs, process.cwd()),
        );
        this.logger.result(
          runtimeOk,
          runtimeOk ? MessageConstant.NEW_CORE_DONE : MessageConstant.NEW_CORE_FAILED,
        );
      }

      const devPkgs = dbEntry.devPackages;
      if (devPkgs.length > 0) {
        const devOk = await this.logger.spinner(MessageConstant.NEW_INSTALLING_DEV, () =>
          this.installer.installDev(pm, devPkgs, process.cwd()),
        );
        this.logger.result(devOk, devOk ? MessageConstant.NEW_DEV_DONE : MessageConstant.NEW_DEV_FAILED);
      }

      for (const cmd of dbEntry.postInstall) {
        const parsed = parseShellArgs(cmd);
        const parts = parsed.filter((p: ParseEntry): p is string => typeof p === 'string');
        const bin = parts[0];
        const args = parts.slice(1);
        if (!bin) continue;

        if (!SAFE_POST_INSTALL_BINS.has(bin)) {
          this.logger.warn(`Skipped unsafe post-install command: ${cmd}`);
          continue;
        }

        this.logger.step(`Running ${cmd}…`);
        const cmdOk = await this.runner.inherit(bin, args, { cwd: process.cwd() });
        this.logger.result(cmdOk, cmdOk ? cmd : `${cmd} failed`);
      }
    }

    const appModulePath = await this.findAppModule(srcDir);
    if (appModulePath) {
      const shouldRegister = await confirm({
        message: MessageConstant.DB_REGISTER_PROMPT,
        default: true,
      });

      if (shouldRegister) {
        const moduleFilePath = path.join(srcDir, 'modules', moduleName, `${moduleName}.module.ts`);
        const relImport = buildRelativeImport(appModulePath, moduleFilePath);

        try {
          await this.registrar.register(appModulePath, `${pascalName}Module`, relImport, 'imports');
          this.logger.success(MessageConstant.DB_REGISTER_DONE(`${pascalName}Module`));
        } catch {
          this.logger.warn(MessageConstant.DB_REGISTER_FAILED);
        }
      }
    }

    this.logger.blank();
    this.printNextSteps(dbEntry, moduleName, pascalName);
  }

  private async resolveOrm(arg: string | undefined, orms: ReadonlyArray<OrmEntry>): Promise<OrmEntry> {
    if (arg) {
      const normalized = arg.toLowerCase();
      const found = orms.find((o) => o.id === normalized || o.id.replace('-', '') === normalized);
      if (found) return found;
    }

    const chosen = await select<string>({
      message: MessageConstant.DB_ORM_PROMPT,
      loop: false,
      choices: orms.map((o) => ({
        value: o.id,
        name: `${o.label.padEnd(16)} ${ANSI.dim(o.description)}`,
      })),
    });

    return orms.find((o) => o.id === chosen) as OrmEntry;
  }

  private async resolveDatabase(orm: OrmEntry): Promise<DbEntry> {
    if (orm.databases.length === 1) {
      const db = orm.databases[0] as DbEntry;
      this.logger.info(`Database: ${db.label}`);
      return db;
    }

    const chosen = await select<string>({
      message: MessageConstant.DB_DATABASE_PROMPT,
      loop: false,
      choices: orm.databases.map((db) => ({ value: db.id, name: db.label })),
    });

    return orm.databases.find((d) => d.id === chosen) as DbEntry;
  }

  private async findAppModule(srcDir: string): Promise<string | null> {
    const candidate = path.join(srcDir, 'app.module.ts');
    return (await this.fs.exists(candidate)) ? candidate : null;
  }

  private printNextSteps(dbEntry: DbEntry, moduleName: string, pascalName: string): void {
    console.log(`  ${ANSI.bold('Next steps:')}`);
    console.log();
    for (const step of dbEntry.nextSteps) {
      const resolved = step.replace('the generated module', `${pascalName}Module`);
      console.log(`    ${ANSI.dim(UnicodeConstant.DASH)}  ${resolved}`);
    }
    console.log();
    console.log(`  ${ANSI.dim('Module path:')} src/modules/${moduleName}/`);
    console.log();
  }
}
