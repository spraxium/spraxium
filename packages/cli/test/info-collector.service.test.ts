import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { InfoCollector } from '../src/service/info-collector.service';

describe('InfoCollector', () => {
  const tempDirs: Array<string> = [];

  function makeProject(pkg: Record<string, unknown>, files: Record<string, string> = {}): string {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'sprax-info-'));
    tempDirs.push(dir);
    writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg), 'utf8');
    for (const [name, contents] of Object.entries(files)) {
      writeFileSync(path.join(dir, name), contents, 'utf8');
    }
    return dir;
  }

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not include a hardcoded CLI version in the report', () => {
    const cwd = makeProject({ name: 'my-bot' });

    const report = new InfoCollector().collectReport(cwd);

    expect(report).not.toHaveProperty('cliVersion');
  });

  it('reads the project name from the nearest package.json', () => {
    const cwd = makeProject({ name: 'my-bot' });

    const report = new InfoCollector().collectReport(cwd);

    expect(report.projectName).toBe('my-bot');
  });

  it('falls back to "(unknown)" when no package name is present', () => {
    const cwd = makeProject({});

    const report = new InfoCollector().collectReport(cwd);

    expect(report.projectName).toBe('(unknown)');
  });

  it('collects @spraxium/* dependency versions from the project package.json', () => {
    const cwd = makeProject({
      name: 'my-bot',
      dependencies: { '@spraxium/core': '1.0.0', 'discord.js': '14.0.0' },
      devDependencies: { '@spraxium/cli': '1.0.0' },
    });

    const report = new InfoCollector().collectReport(cwd);

    expect(report.frameworkVersions['@spraxium/core']).toBe('1.0.0');
    expect(report.frameworkVersions['@spraxium/cli']).toBe('1.0.0');
    expect(report.frameworkVersions['discord.js']).toBeUndefined();
  });

  it('detects the preferred package manager from the packageManager field', () => {
    const cwd = makeProject({ name: 'my-bot', packageManager: 'pnpm@9.0.0' });

    const report = new InfoCollector().collectReport(cwd);

    expect(report.env.packageManager).toBe('pnpm@9.0.0');
  });

  it('detects the preferred package manager from a lockfile', () => {
    const cwd = makeProject({ name: 'my-bot' }, { 'yarn.lock': '' });

    const report = new InfoCollector().collectReport(cwd);

    expect(report.env.packageManager).toBe('yarn');
  });

  it('reports core environment fields', () => {
    const cwd = makeProject({ name: 'my-bot' });

    const report = new InfoCollector().collectReport(cwd);

    expect(report.env.node).toBe(process.version);
    expect(report.env.cwd).toBe(cwd);
    expect(typeof report.env.os).toBe('string');
    expect(report.env.os.length).toBeGreaterThan(0);
  });
});
