import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { InstallResult, PackageManager } from '../interfaces';
import type { ProcessRunner } from './process-runner.service';

export class ProjectInstaller {
  constructor(private readonly runner: ProcessRunner) {}

  detectMonorepoRoot(): string | null {
    try {
      const distDir = path.dirname(fileURLToPath(import.meta.url));
      const candidate = path.resolve(distDir, '../../..');
      const coreExists = existsSync(path.join(candidate, 'packages', 'core', 'package.json'));
      return coreExists ? candidate : null;
    } catch {
      return null;
    }
  }

  resolvePackageRef(monorepoRoot: string | null, pkg: string, pm?: PackageManager): string {
    if (!monorepoRoot || !pkg.startsWith('@spraxium/')) return pkg;
    const shortName = pkg.slice('@spraxium/'.length);
    const localPath = path.join(monorepoRoot, 'packages', shortName);
    if (existsSync(path.join(localPath, 'package.json'))) {
      const protocol = pm === 'pnpm' ? 'link:' : 'file:';
      return `${protocol}${localPath}`;
    }
    return pkg;
  }

  async installRuntime(pm: PackageManager, pkgs: ReadonlyArray<string>, cwd: string): Promise<InstallResult> {
    return this.runner.capture(pm, this.runtimeArgs(pm, pkgs), { cwd });
  }

  async installDev(pm: PackageManager, pkgs: ReadonlyArray<string>, cwd: string): Promise<InstallResult> {
    return this.runner.capture(pm, this.devArgs(pm, pkgs), { cwd });
  }

  private runtimeArgs(pm: PackageManager, pkgs: ReadonlyArray<string>): Array<string> {
    return pm === 'npm' ? ['install', ...pkgs] : ['add', ...pkgs];
  }

  private devArgs(pm: PackageManager, pkgs: ReadonlyArray<string>): Array<string> {
    switch (pm) {
      case 'npm':
        return ['install', '--save-dev', ...pkgs];
      case 'yarn':
        return ['add', '--dev', ...pkgs];
      default:
        return ['add', '-D', ...pkgs];
    }
  }
}
