import path from 'node:path';
import { confirm, input, select } from '@inquirer/prompts';
import { ANSI } from '@spraxium/logger';
import type { Command } from 'commander';
import { GenerateConstant, MessageConstant, RegexConstant } from '../constants';
import { BaseCommand } from '../core/base.command';
import { CliError } from '../errors';
import type { Schematic } from '../interfaces';
import type { SchematicRegistry } from '../schematics/schematic.registry';
import type { FileSystem } from '../service/file-system.service';
import type { ModuleRegistrar } from '../service/module-registrar.service';
import type { ProjectDetector } from '../service/project-detector.service';
import type { SchematicLoader } from '../service/schematic-loader.service';
import type { CliLogger } from '../ui/cli.logger';
import { toKebabCase, toPascalCase } from '../utils/case.util';
import { buildRelativeImport } from '../utils/path.util';

export class GenerateCommand extends BaseCommand {
  constructor(
    logger: CliLogger,
    private readonly registry: SchematicRegistry,
    private readonly fs: FileSystem,
    private readonly detector: ProjectDetector,
    private readonly registrar: ModuleRegistrar,
    private readonly loader: SchematicLoader,
  ) {
    super(logger);
  }

  register(program: Command): void {
    program
      .command('generate [schematic] [name]')
      .alias('g')
      .description('Generate a Spraxium schematic (module, service, listener, command, and more)')
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

    const contents = await this.loader.render(schematic.name, pascalName, kebabName);
    await this.fs.writeFile(destPath, contents);
    this.logger.success(`Created  ${path.relative(process.cwd(), destPath)}`);

    if (schematic.moduleArray && chosenModuleDir) {
      await this.registerInModule(schematic, pascalName, chosenModuleDir, destPath);
    }
  }

  private async registerInModule(
    schematic: Schematic,
    pascalName: string,
    chosenModuleDir: string,
    destPath: string,
  ): Promise<void> {
    const moduleFile = await this.registrar.findModuleFile(chosenModuleDir);
    if (!moduleFile) return;

    const relImport = buildRelativeImport(moduleFile, destPath);
    const className = this.resolveClassName(schematic, pascalName);

    const patched = await this.registrar.register(moduleFile, className, relImport, schematic.moduleArray);
    if (patched) {
      this.logger.success(
        `Registered ${className} in ${path.relative(process.cwd(), moduleFile)} → ${schematic.moduleArray}[]`,
      );
    }
  }

  private async resolveSchematic(arg?: string): Promise<Schematic> {
    if (arg) return this.registry.resolve(arg);

    const chosen = await select({
      message: MessageConstant.GENERATE_WHICH_SCHEMATIC,
      loop: false,
      choices: this.registry.list().map((s) => ({
        value: s.name,
        name: `${s.name.padEnd(16)} ${ANSI.dim(s.description)}`,
      })),
    });
    return this.registry.resolve(chosen);
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

    const trimmed = rawName.trim();
    if (!RegexConstant.SCHEMATIC_NAME.test(trimmed)) {
      throw new CliError(MessageConstant.GENERATE_INVALID_NAME(trimmed));
    }

    const kebabName = toKebabCase(trimmed);
    this.validateNameDoesNotRepeatSuffix(kebabName, schematic);

    return { pascalName: toPascalCase(trimmed), kebabName };
  }

  private validateNameDoesNotRepeatSuffix(kebabName: string, schematic: Schematic): void {
    const suffix = schematic.fileSuffix;
    if (kebabName === suffix || kebabName.endsWith(`-${suffix}`)) {
      throw new CliError(MessageConstant.GENERATE_SUFFIX_ERROR(kebabName, suffix));
    }
  }

  private resolveClassName(schematic: Schematic, pascalName: string): string {
    const classSuffix = GenerateConstant.CLASS_SUFFIX_MAP[schematic.name] ?? toPascalCase(schematic.name);
    return `${pascalName}${classSuffix}`;
  }

  private findSrcRoot(): string {
    const srcDir = this.detector.findSrcDir();
    if (!srcDir) throw new CliError(MessageConstant.NO_SRC_DIR);
    return srcDir;
  }

  private async resolveTargetDir(
    srcRoot: string,
    schematic: Schematic,
    kebabName: string,
  ): Promise<{ targetDir: string; chosenModuleDir: string | null }> {
    const modulesRoot = path.join(srcRoot, 'modules');

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
    return GenerateConstant.SUB_DIR_MAP[schematicName] ?? GenerateConstant.DEFAULT_SUB_DIR;
  }
}
