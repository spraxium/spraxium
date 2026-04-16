#!/usr/bin/env node

import { BuildCommand } from './commands/build.command';
import { DatabaseCommand } from './commands/database.command';
import { DevCommand } from './commands/dev.command';
import { GenerateCommand } from './commands/generate.command';
import { InfoCommand } from './commands/info.command';
import { NewCommand } from './commands/new.command';
import { StartCommand } from './commands/start.command';
import { CommandRegistry } from './core/command.registry';
import { ALL_SCHEMATICS } from './schematics/schematic.registry';
import { ConfigReader } from './service/config-reader.service';
import { DatabaseTemplateService } from './service/database-template.service';
import { FileSystem } from './service/file-system.service';
import { InfoCollector } from './service/info-collector.service';
import { ModuleRegistrar } from './service/module-registrar.service';
import { ProcessRunner } from './service/process-runner.service';
import { ProjectDetector } from './service/project-detector.service';
import { ProjectInstaller } from './service/project-installer.service';
import { ScaffoldService } from './service/scaffold.service';
import { SchematicLoader } from './service/schematic-loader.service';
import { TemplateService } from './service/template.service';
import { CliLogger } from './ui/cli.logger';

const logger = new CliLogger();
const detector = new ProjectDetector();
const configReader = new ConfigReader();
const fs = new FileSystem();
const runner = new ProcessRunner();
const registrar = new ModuleRegistrar(fs);
const infoCollector = new InfoCollector();
const schematicLoader = new SchematicLoader();
const templateService = new TemplateService();
const scaffolder = new ScaffoldService(templateService, fs);
const installer = new ProjectInstaller(runner);
const dbTemplateService = new DatabaseTemplateService();

const registry = new CommandRegistry([
  new DevCommand(logger, detector, configReader),
  new StartCommand(logger),
  new BuildCommand(logger, runner),
  new GenerateCommand(logger, ALL_SCHEMATICS, fs, detector, registrar, schematicLoader),
  new InfoCommand(logger, infoCollector),
  new NewCommand(logger, scaffolder, installer, runner),
  new DatabaseCommand(logger, detector, fs, installer, runner, registrar, dbTemplateService),
]);

registry.registerAll();
registry.parse();
