import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execa } from 'execa';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { VersionSwitchRegistry } from './fixtures/version-switch-registry';

const cli = fileURLToPath(new URL('../src/index.ts', import.meta.url));
const tsx = pathToFileURL(createRequire(import.meta.url).resolve('tsx')).href;
const registry = new VersionSwitchRegistry();
let directory: string;

async function use(cwd: string, ...args: Array<string>) {
  return execa(process.execPath, ['--import', tsx, cli, 'use', ...args], { cwd, reject: false, all: true });
}

async function installedVersion(cwd: string, name: string): Promise<string> {
  const locations = createRequire(path.join(cwd, 'package.json')).resolve.paths(name) ?? [];
  for (const location of locations) {
    const file = path.join(location, name, 'package.json');
    if (!existsSync(file)) continue;
    return (JSON.parse(await readFile(file, 'utf8')) as { version: string }).version;
  }
  throw new Error(`${name} is not installed for ${cwd}.`);
}

beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'spraxium-use-'));
  await registry.start(directory);
}, 20_000);

afterAll(async () => {
  await registry.close();
  if (directory) await rm(directory, { recursive: true, force: true });
});

describe('spraxium use', () => {
  it.each(['npm', 'pnpm'])(
    'switches and restores a bot in a %s workspace',
    async (manager) => {
      const workspace = path.join(directory, manager);
      const project = path.join(workspace, 'apps', 'bot');
      const sibling = path.join(workspace, 'apps', 'stable-bot');
      const src = path.join(project, 'src');
      const manifest = path.join(project, 'package.json');
      const lockfile = path.join(workspace, manager === 'npm' ? 'package-lock.json' : 'pnpm-lock.yaml');
      const rootPackage = { name: 'workspace', private: true, workspaces: ['apps/*'] };
      const projectPackage = {
        name: 'my-test-bot',
        version: '0.0.1',
        private: true,
        dependencies: { '@spraxium/core': '^0.9.0' },
        devDependencies: { '@spraxium/cli': '^0.9.0' },
      };
      await mkdir(src, { recursive: true });
      await mkdir(sibling);
      await writeFile(path.join(workspace, 'package.json'), JSON.stringify(rootPackage));
      await writeFile(manifest, JSON.stringify(projectPackage));
      await writeFile(
        path.join(sibling, 'package.json'),
        JSON.stringify({ name: 'stable-bot', private: true, dependencies: { '@spraxium/core': '0.9.0' } }),
      );
      await writeFile(
        path.join(workspace, '.npmrc'),
        `registry=${registry.origin}\n@spraxium:registry=${registry.origin}\nfetch-retries=0\naudit=false\nfund=false\n`,
      );
      if (manager === 'pnpm') {
        await writeFile(
          path.join(workspace, 'pnpm-workspace.yaml'),
          'packages:\n  - apps/*\nminimumReleaseAge: 0\n',
        );
      }
      const argumentsForInstall = manager === 'pnpm' ? ['install', '--no-frozen-lockfile'] : ['install'];
      await execa(manager, argumentsForInstall, { cwd: workspace });

      const originalManifest = await readFile(manifest, 'utf8');
      const originalLockfile = await readFile(lockfile, 'utf8');
      const dryRun = await use(src, 'next', '--dry-run');
      expect(dryRun.all).toContain('Dry run');
      expect(dryRun.all).toContain('1.0.0-dev.45');
      expect(dryRun.exitCode).toBe(0);
      expect(await readFile(manifest, 'utf8')).toBe(originalManifest);
      expect(await readFile(lockfile, 'utf8')).toBe(originalLockfile);

      const incomplete = await use(project, '1.0.0-dev.80');
      expect(incomplete.all).toContain(
        'Could not verify Spraxium 1.0.0-dev.80 in the npm registry for @spraxium/cli.',
      );
      expect(incomplete.exitCode).toBe(1);
      expect(await readFile(manifest, 'utf8')).toBe(originalManifest);
      expect(await readFile(lockfile, 'utf8')).toBe(originalLockfile);

      const preview = await use(project, 'next');
      expect(preview.all).toContain(`Installed and verified 2 Spraxium packages with ${manager}`);
      expect(preview.exitCode).toBe(0);
      expect(await readFile(manifest, 'utf8')).toContain('"@spraxium/cli": "1.0.0-dev.45"');
      expect(await readFile(lockfile, 'utf8')).toContain('1.0.0-dev.45');
      expect(await installedVersion(project, '@spraxium/core')).toBe('1.0.0-dev.45');
      expect(await installedVersion(project, '@spraxium/cli')).toBe('1.0.0-dev.45');
      expect(await installedVersion(sibling, '@spraxium/core')).toBe('0.9.0');

      const pinned = await use(project, '1.0.0-dev.42');
      expect(pinned.all).toContain('Installed and verified');
      expect(pinned.exitCode).toBe(0);
      expect(await installedVersion(project, '@spraxium/core')).toBe('1.0.0-dev.42');

      const beforeFailureManifest = await readFile(manifest, 'utf8');
      const beforeFailureLockfile = await readFile(lockfile, 'utf8');
      const failure = await use(project, '1.0.0-dev.99');
      expect(failure.all).toContain('Restored the previous Spraxium dependencies.');
      expect(failure.exitCode).toBe(1);
      expect(await readFile(manifest, 'utf8')).toBe(beforeFailureManifest);
      expect(await readFile(lockfile, 'utf8')).toBe(beforeFailureLockfile);
      expect(await installedVersion(project, '@spraxium/core')).toBe('1.0.0-dev.42');
      expect(existsSync(path.join(workspace, '.spraxium-use.lock'))).toBe(false);

      const stable = await use(project, 'stable');
      expect(stable.all).toContain('Resolved stable → 0.9.0');
      expect(stable.exitCode, stable.all).toBe(0);
      expect(await installedVersion(project, '@spraxium/core')).toBe('0.9.0');
      expect(await installedVersion(project, '@spraxium/cli')).toBe('0.9.0');
      expect(await installedVersion(sibling, '@spraxium/core')).toBe('0.9.0');
      const resultPackage = JSON.parse(await readFile(manifest, 'utf8'));
      expect(resultPackage).toEqual({
        ...projectPackage,
        dependencies: { '@spraxium/core': '0.9.0' },
        devDependencies: { '@spraxium/cli': '0.9.0' },
      });
      expect(await readFile(path.join(workspace, 'package.json'), 'utf8')).toBe(JSON.stringify(rootPackage));
    },
    45_000,
  );
});
