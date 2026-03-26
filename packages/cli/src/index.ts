#!/usr/bin/env node

import { BuildCommand } from './commands/build.command';
import { DevCommand } from './commands/dev.command';
import { GenerateCommand } from './commands/generate.command';
import { InfoCommand } from './commands/info.command';
import { StartCommand } from './commands/start.command';
import { CommandRegistry } from './core/command-registry';
import { ALL_SCHEMATICS } from './schematics/schematic-registry';
import { ConfigReader } from './services/config-reader';
import { FileSystem } from './services/file-system';
import { InfoCollector } from './services/info-collector';
import { ModuleRegistrar } from './services/module-registrar';
import { ProcessRunner } from './services/process-runner';
import { ProjectDetector } from './services/project-detector';
import { CliLogger } from './ui/cli-logger';

const logger = new CliLogger();
const detector = new ProjectDetector();
const configReader = new ConfigReader();
const fs = new FileSystem();
const runner = new ProcessRunner();
const registrar = new ModuleRegistrar(fs);
const infoCollector = new InfoCollector();

const registry = new CommandRegistry([
  new DevCommand(logger, detector, configReader),
  new StartCommand(logger),
  new BuildCommand(logger, runner),
  new GenerateCommand(logger, ALL_SCHEMATICS, fs, detector, registrar),
  new InfoCommand(logger, infoCollector),
]);

registry.registerAll();
registry.parse();
