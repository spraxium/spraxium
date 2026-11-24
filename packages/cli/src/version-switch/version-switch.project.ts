import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { minimatch } from 'minimatch';
import semver from 'semver';
import changesets from '../../../../.changeset/config.json';
import type { PackageManager } from '../interfaces/package-manager.type';
import type { FrameworkDependency } from './interfaces/framework-dependency.interface';

const FRAMEWORK_PACKAGES = new Set(changesets.fixed.find((group) => group.includes('@spraxium/core')));
const DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies', 'optionalDependencies'] as const;
const MANAGER_LOCKFILES: Record<PackageManager, ReadonlyArray<string>> = {
  pnpm: ['pnpm-lock.yaml'],
  npm: ['package-lock.json', 'npm-shrinkwrap.json'],
  yarn: ['yarn.lock'],
  bun: ['bun.lock', 'bun.lockb'],
};
const MANAGERS: ReadonlyArray<PackageManager> = ['pnpm', 'npm', 'yarn', 'bun'];

export class VersionSwitchProject {
  readonly manifestPath: string;
  readonly lockfilePaths: ReadonlyArray<string>;

  private constructor(
    readonly directory: string,
    readonly workspaceRoot: string,
    readonly manager: PackageManager,
    readonly manifestSource: string,
  ) {
    this.manifestPath = path.join(directory, 'package.json');
    const directories = workspaceRoot === directory ? [directory] : [workspaceRoot, directory];
    this.lockfilePaths = directories.flatMap((dir) =>
      MANAGER_LOCKFILES[manager].map((file) => path.join(dir, file)),
    );
  }

  static open(cwd: string): VersionSwitchProject {
    const directory = VersionSwitchProject.findProjectDirectory(realpathSync(cwd));
    const manifestPath = path.join(directory, 'package.json');
    const source = readFileSync(manifestPath, 'utf8');
    const manifest = VersionSwitchProject.parseManifest(source, manifestPath);
    const workspaceRoot = VersionSwitchProject.findWorkspaceRoot(directory);
    const workspaceManifest =
      workspaceRoot === directory ? manifest : VersionSwitchProject.readManifest(workspaceRoot);
    let manager = VersionSwitchProject.detectManager(workspaceRoot, workspaceManifest);
    if (!manager && workspaceRoot !== directory)
      manager = VersionSwitchProject.detectManager(directory, manifest);
    return new VersionSwitchProject(directory, workspaceRoot, manager ?? 'npm', source);
  }

  dependencies(): ReadonlyArray<FrameworkDependency> {
    const manifest = VersionSwitchProject.parseManifest(this.manifestSource, this.manifestPath);
    const selected = new Map<string, FrameworkDependency>();
    for (const section of DEPENDENCY_SECTIONS) {
      const dependencies = this.readSection(manifest, section);
      for (const [name, specifier] of Object.entries(dependencies)) {
        if (!FRAMEWORK_PACKAGES.has(name)) continue;
        if (typeof specifier !== 'string' || !VersionSwitchProject.isRegistryReference(specifier)) {
          throw new Error(
            `${name} uses a non-registry dependency reference in ${section}: ${String(specifier)}.`,
          );
        }
        if (!selected.has(name)) selected.set(name, { name, current: specifier });
      }
    }
    if (selected.size === 0)
      throw new Error(`No published Spraxium packages declared in ${this.manifestPath}.`);
    return [...selected.values()];
  }

  render(version: string): string {
    const manifest = VersionSwitchProject.parseManifest(this.manifestSource, this.manifestPath);
    for (const section of DEPENDENCY_SECTIONS) {
      const dependencies = this.readSection(manifest, section);
      for (const name of Object.keys(dependencies)) {
        if (FRAMEWORK_PACKAGES.has(name)) dependencies[name] = version;
      }
    }
    const indent = this.manifestSource.match(/^[ \t]+(?=")/m)?.[0] ?? '  ';
    const newline = this.manifestSource.includes('\r\n') ? '\r\n' : '\n';
    const bom = this.manifestSource.startsWith('\uFEFF') ? '\uFEFF' : '';
    const trailingNewline = this.manifestSource.endsWith('\n') ? newline : '';
    return `${bom}${JSON.stringify(manifest, null, indent).replace(/\n/g, newline)}${trailingNewline}`;
  }

  private readSection(manifest: Record<string, unknown>, section: string): Record<string, unknown> {
    const dependencies = manifest[section];
    if (dependencies === undefined) return {};
    if (VersionSwitchProject.isRecord(dependencies)) return dependencies;
    throw new Error(`Expected an object for ${section} in ${this.manifestPath}.`);
  }

  private static findProjectDirectory(cwd: string): string {
    let directory = cwd;
    while (true) {
      if (existsSync(path.join(directory, 'package.json'))) return directory;
      const parent = path.dirname(directory);
      if (directory === parent)
        throw new Error(`No package.json found from ${cwd}. Run this command from your bot.`);
      directory = parent;
    }
  }

  private static findWorkspaceRoot(project: string): string {
    let directory = project;
    while (true) {
      if (existsSync(path.join(directory, 'pnpm-workspace.yaml'))) return directory;
      if (VersionSwitchProject.includesWorkspace(directory, project)) return directory;
      const parent = path.dirname(directory);
      if (directory === parent) return project;
      directory = parent;
    }
  }

  private static includesWorkspace(directory: string, project: string): boolean {
    if (directory === project) return false;
    const workspaces = VersionSwitchProject.readManifest(directory)?.workspaces;
    const patterns: unknown = VersionSwitchProject.isRecord(workspaces) ? workspaces.packages : workspaces;
    if (!Array.isArray(patterns)) return false;
    const relative = path.relative(directory, project).split(path.sep).join('/');
    let included = false;
    for (const pattern of patterns) {
      if (typeof pattern !== 'string') continue;
      const exclude = pattern.startsWith('!');
      const glob = (exclude ? pattern.slice(1) : pattern).replace(/^\.\//, '').replace(/\/$/, '');
      if (minimatch(relative, glob, { dot: true, nonegate: true })) included = !exclude;
    }
    return included;
  }

  private static detectManager(
    directory: string,
    manifest: Record<string, unknown> | null,
  ): PackageManager | undefined {
    const requested = manifest?.packageManager;
    if (typeof requested === 'string') {
      const declared = MANAGERS.find((manager) => requested.startsWith(`${manager}@`));
      if (declared) return declared;
      throw new Error(`Unsupported package manager "${requested}" in ${directory}.`);
    }
    if (existsSync(path.join(directory, 'pnpm-workspace.yaml'))) return 'pnpm';

    const matches = MANAGERS.filter((manager) =>
      MANAGER_LOCKFILES[manager].some((file) => existsSync(path.join(directory, file))),
    );
    if (matches.length > 1) {
      throw new Error(
        `Multiple package managers detected in ${directory}. Set "packageManager" in package.json.`,
      );
    }
    return matches[0];
  }

  private static readManifest(directory: string): Record<string, unknown> | null {
    const file = path.join(directory, 'package.json');
    if (!existsSync(file)) return null;
    return VersionSwitchProject.parseManifest(readFileSync(file, 'utf8'), file);
  }

  private static parseManifest(source: string, file: string): Record<string, unknown> {
    try {
      const manifest: unknown = JSON.parse(source.replace(/^\uFEFF/, ''));
      if (VersionSwitchProject.isRecord(manifest)) return manifest;
    } catch (error) {
      throw new Error(`Unable to read package.json at ${file}.`, { cause: error });
    }
    throw new Error(`Expected a JSON object in ${file}.`);
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private static isRegistryReference(specifier: string): boolean {
    return semver.validRange(specifier) !== null || /^[a-zA-Z][0-9a-zA-Z._-]*$/.test(specifier);
  }
}
