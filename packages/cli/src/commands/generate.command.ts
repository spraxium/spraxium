import path from 'node:path';
import { confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import type { Command } from 'commander';
import { MessageConstant } from '../constants';
import { BaseCommand } from '../core/base.command';
import type { Schematic } from '../interfaces';
import { buildSchematicLookup } from '../schematics/schematic.registry';
import type { FileSystem } from '../services/file-system.service';
import type { ModuleRegistrar } from '../services/module-registrar.service';
import type { ProjectDetector } from '../services/project-detector.service';
import type { CliLogger } from '../ui/cli.logger';
import { toKebabCase, toPascalCase } from '../utils/case.util';
import { buildRelativeImport } from '../utils/path.util';

export class GenerateCommand extends BaseCommand {
  private readonly lookup: Map<string, Schematic>;

  constructor(
    logger: CliLogger,
    private readonly schematics: Array<Schematic>,
    private readonly fs: FileSystem,
    private readonly detector: ProjectDetector,
    private readonly registrar: ModuleRegistrar,
  ) {
    super(logger);
    this.lookup = buildSchematicLookup(schematics);
  }

  register(program: Command): void {
    program
      .command('generate [schematic] [name]')
      .alias('g')
      .description('Generate a Spraxium schematic (module, service, task, boot-service, listener)')
      .action((schematic?: string, name?: string) => this.run(() => this.execute(schematic, name)));
  }

  private async execute(schematicArg?: string, nameArg?: string): Promise<void> {
    const schematic = await this.resolveSchematic(schematicArg);
    const { pascalName, kebabName } = await this.resolveName(schematic, nameArg);

    const srcRoot = this.findSrcRoot();
    const { targetDir, chosenModuleDir } = await this.resolveTargetDir(srcRoot, schematic, kebabName);

    const fileName = `${kebabName}.${schematic.fileSuffix}.ts`;
    const destPath = path.join(targetDir, fileName);

    if (await this.fs.exists(destPath)) {
      const overwrite = await confirm({
        message: MessageConstant.GENERATE_FILE_EXISTS(fileName),
        default: false,
      });
      if (!overwrite) {
        this.logger.info(MessageConstant.ABORTED);
        return;
      }
    }

    await this.fs.writeFile(destPath, schematic.render(pascalName, kebabName));
    this.logger.success(`Created  ${path.relative(process.cwd(), destPath)}`);

    // Auto-register in the module's @Module() decorator
    if (schematic.moduleArray && chosenModuleDir) {
      const moduleFile = await this.registrar.findModuleFile(chosenModuleDir);
      if (moduleFile) {
        const relImport = buildRelativeImport(moduleFile, destPath);
        const className = this.resolveClassName(schematic, pascalName);

        const patched = await this.registrar.register(
          moduleFile,
          className,
          relImport,
          schematic.moduleArray,
        );
        if (patched) {
          this.logger.success(
            `Registered ${className} in ${path.relative(process.cwd(), moduleFile)} → ${schematic.moduleArray}[]`,
          );
        }
      }
    }
  }

  private async resolveSchematic(arg?: string): Promise<Schematic> {
    if (arg) {
      const found = this.lookup.get(arg);
      if (found) return found;
    }

    const chosen = await select({
      message: MessageConstant.GENERATE_WHICH_SCHEMATIC,
      loop: false,
      choices: this.schematics.map((s) => ({
        value: s.name,
        name: `${s.name.padEnd(16)} ${chalk.dim(s.description)}`,
      })),
    });
    return this.lookup.get(chosen) as Schematic;
  }

  private async resolveName(
    schematic: Schematic,
    arg?: string,
  ): Promise<{ pascalName: string; kebabName: string }> {
    const rawName =
      arg ??
      (await input({
        message: MessageConstant.GENERATE_NAME_PROMPT(schematic.name),
        validate: (v) => v.trim().length > 0 || MessageConstant.GENERATE_NAME_REQUIRED,
      }));

    const kebabName = toKebabCase(rawName);
    this.validateNameDoesNotRepeatSuffix(kebabName, schematic);

    return { pascalName: toPascalCase(rawName), kebabName };
  }

  /**
   * Prevents names like "boot-service" for a boot-service schematic,
   * which would generate "boot-service.service.ts" , redundant suffix.
   */
  private validateNameDoesNotRepeatSuffix(kebabName: string, schematic: Schematic): void {
    const suffix = schematic.fileSuffix;
    if (kebabName === suffix || kebabName.endsWith(`-${suffix}`)) {
      throw new Error(MessageConstant.GENERATE_SUFFIX_ERROR(kebabName, suffix));
    }
  }

  private resolveClassName(schematic: Schematic, pascalName: string): string {
    const suffixMap: Record<string, string> = {
      service: 'Service',
      'boot-service': 'Service',
      task: 'Task',
      listener: 'Listener',
    };
    const classSuffix = suffixMap[schematic.name] ?? toPascalCase(schematic.name);
    return `${pascalName}${classSuffix}`;
  }

  private findSrcRoot(): string {
    const srcDir = this.detector.findSrcDir();
    if (!srcDir) throw new Error(MessageConstant.NO_SRC_DIR);
    return srcDir;
  }

  private async resolveTargetDir(
    srcRoot: string,
    schematic: Schematic,
    kebabName: string,
  ): Promise<{ targetDir: string; chosenModuleDir: string | null }> {
    const modulesRoot = path.join(srcRoot, 'modules');

    // Modules go into their own folder at the root
    if (schematic.name === 'module') {
      return { targetDir: path.join(modulesRoot, kebabName), chosenModuleDir: null };
    }

    const subDir = this.subDirFor(schematic.name);
    const moduleDirs = await this.fs.listDirectories(modulesRoot);

    if (moduleDirs.length === 0) {
      return { targetDir: path.join(modulesRoot, kebabName, subDir), chosenModuleDir: null };
    }

    const chosen = await select({
      message: MessageConstant.GENERATE_WHICH_MODULE(schematic.name),
      loop: false,
      choices: moduleDirs.map((m) => ({ value: m, name: m })),
    });

    const chosenModuleDir = path.join(modulesRoot, chosen);
    return {
      targetDir: path.join(chosenModuleDir, subDir),
      chosenModuleDir,
    };
  }

  private subDirFor(schematicName: string): string {
    switch (schematicName) {
      case 'listener':
        return 'listeners';
      case 'task':
        return 'tasks';
      default:
        return 'services';
    }
  }
}
