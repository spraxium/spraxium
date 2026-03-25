import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RegexConstant } from '../constants';
import type { EnvInfoInterface, InfoReportInterface } from '../interfaces';

export class InfoCollector {
  collectReport(cwd: string): InfoReportInterface {
    const projectPkg = this.readNearestPackageJson(cwd);

    return {
      cliVersion: this.readCliVersion(),
      projectName: typeof projectPkg?.name === 'string' ? projectPkg.name : '(unknown)',
      env: {
        os: `${os.platform()} ${os.release()} (${os.arch()})`,
        node: process.version,
        runtime: process.execPath,
        cwd,
        packageManager: this.detectPreferredPackageManager(cwd, projectPkg),
        packageManagers: {
          npm: this.readCommandVersion('npm', ['-v']),
          pnpm: this.readCommandVersion('pnpm', ['-v']),
          yarn: this.readCommandVersion('yarn', ['-v']),
          bun: this.readCommandVersion('bun', ['-v']),
        },
      },
      frameworkVersions: this.collectFrameworkVersions(cwd, projectPkg),
    };
  }

  readCliVersion(): string {
    const require = createRequire(import.meta.url);

    try {
      const pkgPath = require.resolve('@spraxium/cli/package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version?: string };
      return pkg.version ?? 'unknown';
    } catch {
      // fallback to local workspace scan
    }

    let current = path.dirname(fileURLToPath(import.meta.url));
    while (true) {
      const pkgPath = path.join(current, 'package.json');
      if (existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { name?: string; version?: string };
          if (pkg.name === '@spraxium/cli') {
            return pkg.version ?? 'unknown';
          }
        } catch {
          return 'unknown';
        }
      }

      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }

    return 'unknown';
  }

  private readNearestPackageJson(cwd: string): Record<string, unknown> | null {
    let current = cwd;

    while (true) {
      const pkgPath = path.join(current, 'package.json');
      if (existsSync(pkgPath)) {
        try {
          return JSON.parse(readFileSync(pkgPath, 'utf-8')) as Record<string, unknown>;
        } catch {
          return null;
        }
      }

      const parent = path.dirname(current);
      if (parent === current) return null;
      current = parent;
    }
  }

  private detectPreferredPackageManager(cwd: string, pkg: Record<string, unknown> | null): string {
    const pm = typeof pkg?.packageManager === 'string' ? pkg.packageManager : undefined;
    if (pm) return pm;

    const lockFilePath = this.findUp(cwd, [
      'pnpm-lock.yaml',
      'yarn.lock',
      'package-lock.json',
      'bun.lockb',
      'bun.lock',
    ]);
    if (lockFilePath) {
      const fileName = path.basename(lockFilePath);
      if (fileName === 'pnpm-lock.yaml') return 'pnpm';
      if (fileName === 'yarn.lock') return 'yarn';
      if (fileName === 'package-lock.json') return 'npm';
      if (fileName === 'bun.lockb' || fileName === 'bun.lock') return 'bun';
    }

    const userAgent = (process.env.npm_config_user_agent ?? '').toLowerCase();
    if (userAgent.includes('pnpm')) return 'pnpm';
    if (userAgent.includes('yarn')) return 'yarn';
    if (userAgent.includes('bun')) return 'bun';
    if (userAgent.includes('npm')) return 'npm';

    return 'unknown';
  }

  private readCommandVersion(command: string, args: Array<string>): string {
    const parseOutput = (stdout?: string | null, stderr?: string | null): string => {
      const combined = `${stdout ?? ''}\n${stderr ?? ''}`.trim();
      if (!combined) return 'unknown';

      const line = combined
        .split(RegexConstant.NEWLINE)
        .find((entry) => entry.trim().length > 0)
        ?.trim();
      return line || 'unknown';
    };

    const direct = spawnSync(command, args, { encoding: 'utf-8' });
    if (direct.status === 0) {
      return parseOutput(direct.stdout, direct.stderr);
    }

    if (process.platform === 'win32') {
      const winCandidates = [command, `${command}.cmd`];

      for (const candidate of winCandidates) {
        const res = spawnSync(candidate, args, {
          encoding: 'utf-8',
          windowsHide: true,
        });

        if (res.status === 0) {
          return parseOutput(res.stdout, res.stderr);
        }
      }

      const quotedArgs = args
        .map((arg) => (arg.includes(' ') ? `"${arg.replace(/"/g, '\\"')}"` : arg))
        .join(' ');

      const cmdFallback = spawnSync('cmd.exe', ['/d', '/s', '/c', `${command} ${quotedArgs}`], {
        encoding: 'utf-8',
        windowsHide: true,
      });

      if (cmdFallback.status === 0) {
        return parseOutput(cmdFallback.stdout, cmdFallback.stderr);
      }
    }

    return 'not found';
  }

  private findUp(startDir: string, fileNames: Array<string>): string | null {
    let current = startDir;

    while (true) {
      for (const fileName of fileNames) {
        const filePath = path.join(current, fileName);
        if (existsSync(filePath)) return filePath;
      }

      const parent = path.dirname(current);
      if (parent === current) return null;
      current = parent;
    }
  }

  private collectFrameworkVersions(cwd: string, pkg: Record<string, unknown> | null): Record<string, string> {
    const versions: Record<string, string> = {};

    const depMaps = [pkg?.dependencies, pkg?.devDependencies, pkg?.peerDependencies];
    for (const depMap of depMaps) {
      if (!depMap || typeof depMap !== 'object') continue;
      for (const [name, version] of Object.entries(depMap)) {
        if (name.startsWith('@spraxium/')) {
          versions[name] = String(version);
        }
      }
    }

    const workspaceRoot = this.findWorkspaceRoot(cwd);
    if (!workspaceRoot) return versions;

    const packagesDir = path.join(workspaceRoot, 'packages');
    if (!existsSync(packagesDir)) return versions;

    for (const dirent of readdirSync(packagesDir, { withFileTypes: true })) {
      if (!dirent.isDirectory()) continue;

      const pkgPath = path.join(packagesDir, dirent.name, 'package.json');
      if (!existsSync(pkgPath)) continue;

      try {
        const localPkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { name?: string; version?: string };
        if (localPkg.name?.startsWith('@spraxium/')) {
          versions[localPkg.name] = localPkg.version ?? 'unknown';
        }
      } catch {
        // ignore malformed package.json
      }
    }

    return versions;
  }

  private findWorkspaceRoot(cwd: string): string | null {
    let current = cwd;

    while (true) {
      const pnpmWorkspace = path.join(current, 'pnpm-workspace.yaml');
      if (existsSync(pnpmWorkspace)) return current;

      const parent = path.dirname(current);
      if (parent === current) return null;
      current = parent;
    }
  }
}
