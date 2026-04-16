import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ProjectInstaller } from '../src/service/project-installer.service';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '../../..');

describe('ProjectInstaller.resolvePackageRef', () => {
  it('returns original package when no monorepo root is provided', () => {
    const installer = new ProjectInstaller({} as never);

    const ref = installer.resolvePackageRef(null, '@spraxium/core', 'pnpm');

    expect(ref).toBe('@spraxium/core');
  });

  it('uses link protocol for local spraxium packages with pnpm', () => {
    const installer = new ProjectInstaller({} as never);

    const ref = installer.resolvePackageRef(MONOREPO_ROOT, '@spraxium/common', 'pnpm');

    expect(ref).toBe(`link:${path.join(MONOREPO_ROOT, 'packages', 'common')}`);
  });

  it('uses file protocol for non-pnpm package managers', () => {
    const installer = new ProjectInstaller({} as never);

    const ref = installer.resolvePackageRef(MONOREPO_ROOT, '@spraxium/common', 'npm');

    expect(ref).toBe(`file:${path.join(MONOREPO_ROOT, 'packages', 'common')}`);
  });

  it('returns original package when local package does not exist', () => {
    const installer = new ProjectInstaller({} as never);

    const ref = installer.resolvePackageRef(MONOREPO_ROOT, '@spraxium/non-existent', 'pnpm');

    expect(ref).toBe('@spraxium/non-existent');
  });

  it('does not rewrite non-spraxium package names', () => {
    const installer = new ProjectInstaller({} as never);

    const ref = installer.resolvePackageRef(MONOREPO_ROOT, 'discord.js', 'pnpm');

    expect(ref).toBe('discord.js');
  });
});
