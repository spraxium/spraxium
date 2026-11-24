import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, rename, rm, rmdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ProcessRunner } from '../service/process-runner.service';
import type { FileSnapshot } from './interfaces/file-snapshot.interface';
import type { VersionSwitchPlan } from './interfaces/version-switch-plan.interface';
import type { VersionSwitchProject } from './version-switch.project';

const READ_PNP_VERSIONS = `
  const { readFileSync } = require('node:fs');
  const { join } = require('node:path');
  const { resolveToUnqualified } = require('pnpapi');
  const issuer = join(process.cwd(), 'package.json');
  const versions = process.argv.slice(1).map((name) => {
    try {
      const directory = resolveToUnqualified(name, issuer);
      return JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')).version;
    } catch {
      return null;
    }
  });
  process.stdout.write(JSON.stringify(versions));
`;

export class VersionSwitchInstaller {
  constructor(private readonly runner: Pick<ProcessRunner, 'capture' | 'inherit'>) {}

  async apply(plan: VersionSwitchPlan): Promise<void> {
    const { project, version } = plan;
    const lock = path.join(project.workspaceRoot, '.spraxium-use.lock');
    await this.acquireLock(lock);
    try {
      if ((await readFile(project.manifestPath, 'utf8')) !== project.manifestSource) {
        throw new Error('package.json changed while resolving the release. Run spraxium use again.');
      }

      const snapshots = await this.snapshot(project);
      await this.writeManifest(project, project.render(version));
      try {
        await this.refreshNpmWorkspaceLock(plan, snapshots);
        if (!(await this.install(project, false))) throw new Error(`${project.manager} install failed.`);
        await this.verifyInstalled(plan);
      } catch (error) {
        await this.rollback(project, snapshots, error);
      }
    } finally {
      await rmdir(lock);
    }
  }

  private async acquireLock(lock: string): Promise<void> {
    try {
      await mkdir(lock);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
        throw new Error(`A Spraxium version switch lock already exists at ${lock}.`, { cause: error });
      }
      throw error;
    }
  }

  private async snapshot(project: VersionSwitchProject): Promise<ReadonlyArray<FileSnapshot>> {
    return Promise.all(
      [project.manifestPath, ...project.lockfilePaths].map(async (file) => {
        try {
          return { path: file, contents: await readFile(file) };
        } catch (error) {
          if (
            error instanceof Error &&
            'code' in error &&
            error.code === 'ENOENT' &&
            file !== project.manifestPath
          ) {
            return { path: file, contents: null };
          }
          throw error;
        }
      }),
    );
  }

  private async writeManifest(project: VersionSwitchProject, content: string): Promise<void> {
    const temp = `${project.manifestPath}.${randomUUID()}.tmp`;
    const { mode } = await stat(project.manifestPath);
    try {
      await writeFile(temp, content, { flag: 'wx', mode });
      await rename(temp, project.manifestPath);
    } finally {
      await rm(temp, { force: true });
    }
  }

  private async install(project: VersionSwitchProject, frozen: boolean): Promise<boolean> {
    const args = ['install'];
    const { manager, directory: cwd } = project;
    if (manager === 'npm') {
      return this.runner.inherit('npm', [frozen ? 'ci' : 'install'], {
        cwd: project.workspaceRoot,
        preferLocal: false,
      });
    }
    if (manager === 'pnpm') args.push(frozen ? '--frozen-lockfile' : '--no-frozen-lockfile');
    if (manager === 'bun' && frozen) args.push('--frozen-lockfile');
    if (manager === 'yarn' && frozen) {
      const result = await this.runner.capture(manager, ['--version'], { cwd, preferLocal: false });
      if (!result.ok) return false;
      args.push(result.output.trim().startsWith('1.') ? '--frozen-lockfile' : '--immutable');
    }

    const env = manager === 'yarn' && !frozen ? { YARN_ENABLE_IMMUTABLE_INSTALLS: 'false' } : undefined;
    return this.runner.inherit(manager, args, { cwd, preferLocal: false, env });
  }

  private async refreshNpmWorkspaceLock(
    plan: VersionSwitchPlan,
    snapshots: ReadonlyArray<FileSnapshot>,
  ): Promise<void> {
    const { project, dependencies, version } = plan;
    if (project.manager !== 'npm' || project.directory === project.workspaceRoot) return;

    const shrinkwrap = path.join(project.workspaceRoot, 'npm-shrinkwrap.json');
    const packageLock = path.join(project.workspaceRoot, 'package-lock.json');
    const lockfile =
      snapshots.find((file) => file.path === shrinkwrap && file.contents !== null) ??
      snapshots.find((file) => file.path === packageLock && file.contents !== null);
    if (!lockfile?.contents) return;

    const lock = JSON.parse(lockfile.contents.toString('utf8').replace(/^\uFEFF/, '')) as {
      packages?: Record<string, { version?: string } | undefined>;
    };
    if (!lock?.packages) return;

    const workspace = path.relative(project.workspaceRoot, project.directory).split(path.sep).join('/');
    const entries = Object.keys(lock.packages);
    let changed = false;
    for (const { name } of dependencies) {
      const key = `${workspace}/node_modules/${name}`;
      const resolution = lock.packages[key];
      if (!resolution?.version || resolution.version === version) continue;
      for (const entry of entries) {
        if (entry === key || entry.startsWith(`${key}/node_modules/`)) delete lock.packages[entry];
      }
      changed = true;
    }
    if (changed) await writeFile(lockfile.path, `${JSON.stringify(lock, null, 2)}\n`);
  }

  private async verifyInstalled(plan: VersionSwitchPlan): Promise<void> {
    const { project, dependencies, version } = plan;
    const names = dependencies.map(({ name }) => name);
    const pnp =
      project.manager === 'yarn' &&
      ['.pnp.cjs', '.pnp.js'].some((file) => existsSync(path.join(project.workspaceRoot, file)));
    const installed = pnp
      ? await this.readPnpVersions(project, names)
      : names.map((name) => this.readInstalledVersion(project, name));
    const mismatches: Array<string> = [];
    for (const [index, name] of names.entries()) {
      const actual = installed[index];
      if (actual !== version) mismatches.push(`${name} (${typeof actual === 'string' ? actual : 'missing'})`);
    }
    if (mismatches.length > 0) {
      throw new Error(`Expected Spraxium ${version} after installation, but found ${mismatches.join(', ')}.`);
    }
  }

  private readInstalledVersion(project: VersionSwitchProject, name: string): unknown {
    let directory = project.directory;
    while (true) {
      const file = path.join(directory, 'node_modules', name, 'package.json');
      if (existsSync(file)) {
        const manifest = JSON.parse(readFileSync(file, 'utf8')) as { version?: unknown };
        return manifest.version;
      }
      if (directory === project.workspaceRoot) return null;
      directory = path.dirname(directory);
    }
  }

  private async readPnpVersions(
    project: VersionSwitchProject,
    names: ReadonlyArray<string>,
  ): Promise<ReadonlyArray<unknown>> {
    const result = await this.runner.capture('yarn', ['node', '-e', READ_PNP_VERSIONS, ...names], {
      cwd: project.directory,
      preferLocal: false,
    });
    if (result.ok) {
      const versions: unknown = JSON.parse(result.output);
      if (Array.isArray(versions)) return versions;
    }
    throw new Error('Could not verify installed Spraxium versions with Yarn Plug’n’Play.');
  }

  private async rollback(
    project: VersionSwitchProject,
    snapshots: ReadonlyArray<FileSnapshot>,
    cause: unknown,
  ): Promise<never> {
    const message = cause instanceof Error ? cause.message : String(cause);
    const restored = await this.restoreFiles(snapshots);
    if (!restored) throw new Error(`${message} Could not restore all project files.`, { cause });

    const hasLockfile = snapshots.some(
      (file) => file.path !== project.manifestPath && file.contents !== null,
    );
    const reinstalled = await this.install(project, hasLockfile);
    const filesRestored = await this.restoreFiles(snapshots);
    if (!filesRestored) throw new Error(`${message} Could not restore all project files.`, { cause });
    if (!reinstalled) {
      throw new Error(
        `${message} Restored project files, but reinstalling the previous dependencies failed.`,
        { cause },
      );
    }
    throw new Error(`${message} Restored the previous Spraxium dependencies.`, { cause });
  }

  private async restoreFiles(snapshots: ReadonlyArray<FileSnapshot>): Promise<boolean> {
    const results = await Promise.allSettled(
      snapshots.map(({ path: file, contents }) => {
        if (contents === null) return rm(file, { force: true });
        return writeFile(file, contents);
      }),
    );
    return results.every((result) => result.status === 'fulfilled');
  }
}
