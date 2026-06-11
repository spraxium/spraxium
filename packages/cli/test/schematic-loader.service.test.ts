import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CliError } from '../src/errors';
import { SchematicLoader, type TemplateDownloader } from '../src/service/schematic-loader.service';

function makeTempDir(): string {
  return mkdtempSync(path.join(os.tmpdir(), 'sprax-loader-'));
}

function writeSchematicTemplate(dir: string, name: string, contents: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${name}.txt`), contents, 'utf8');
}

describe('SchematicLoader', () => {
  const tempDirs: Array<string> = [];

  function trackTemp(): string {
    const dir = makeTempDir();
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) rmSync(dir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('local-first resolution', () => {
    it('renders a template from the local monorepo without downloading', async () => {
      const origin = trackTemp();
      writeSchematicTemplate(
        path.join(origin, 'templates', 'schematics'),
        'service',
        'export class {{pascalName}}Service {} // {{kebabName}}',
      );

      const download = vi.fn();
      const loader = new SchematicLoader({ originDir: origin, download: download as TemplateDownloader });

      const result = await loader.render('service', 'User', 'user');

      expect(result).toBe('export class UserService {} // user');
      expect(download).not.toHaveBeenCalled();
    });

    it('walks up parent directories to find the templates folder', async () => {
      const root = trackTemp();
      writeSchematicTemplate(path.join(root, 'templates', 'schematics'), 'module', '{{pascalName}}');
      const nested = path.join(root, 'a', 'b', 'c');
      mkdirSync(nested, { recursive: true });

      const loader = new SchematicLoader({ originDir: nested });

      await expect(loader.render('module', 'Billing', 'billing')).resolves.toBe('Billing');
    });
  });

  describe('installed-package resolution (giget)', () => {
    it('downloads templates via giget when no local templates exist', async () => {
      const origin = trackTemp();
      const cacheDir = path.join(trackTemp(), 'schematics-cache');

      const download: TemplateDownloader = vi.fn(async (_source, opts) => {
        writeSchematicTemplate(opts.dir, 'listener', 'class {{pascalName}}Listener {}');
        return {};
      });

      const loader = new SchematicLoader({
        originDir: origin,
        cacheDir,
        source: 'github:spraxium/spraxium/templates/schematics#main',
        download,
      });

      const result = await loader.render('listener', 'Ready', 'ready');

      expect(result).toBe('class ReadyListener {}');
      expect(download).toHaveBeenCalledWith('github:spraxium/spraxium/templates/schematics#main', {
        dir: cacheDir,
        forceClean: true,
      });
    });

    it('does not depend on local monorepo paths for installed usage', async () => {
      const origin = trackTemp(); // empty dir outside any monorepo
      const cacheDir = path.join(trackTemp(), 'cache');

      const download: TemplateDownloader = vi.fn(async (_source, opts) => {
        writeSchematicTemplate(opts.dir, 'guard', 'guard');
        return {};
      });

      const loader = new SchematicLoader({ originDir: origin, cacheDir, download });

      await expect(loader.render('guard', 'Auth', 'auth')).resolves.toBe('guard');
      expect(download).toHaveBeenCalledOnce();
    });

    it('downloads only once and reuses the resolved directory across renders', async () => {
      const origin = trackTemp();
      const cacheDir = path.join(trackTemp(), 'cache');

      const download: TemplateDownloader = vi.fn(async (_source, opts) => {
        writeSchematicTemplate(opts.dir, 'service', '{{pascalName}}');
        writeSchematicTemplate(opts.dir, 'task', '{{pascalName}}Task');
        return {};
      });

      const loader = new SchematicLoader({ originDir: origin, cacheDir, download });

      await loader.render('service', 'A', 'a');
      await loader.render('task', 'B', 'b');

      expect(download).toHaveBeenCalledOnce();
    });
  });

  describe('error handling', () => {
    it('throws a CliError when the requested schematic template is missing', async () => {
      const origin = trackTemp();
      const cacheDir = path.join(trackTemp(), 'cache');

      const download: TemplateDownloader = vi.fn(async (_source, opts) => {
        writeSchematicTemplate(opts.dir, 'service', '{{pascalName}}');
        return {};
      });

      const loader = new SchematicLoader({ originDir: origin, cacheDir, download });

      await expect(loader.render('does-not-exist', 'X', 'x')).rejects.toBeInstanceOf(CliError);
    });

    it('throws a CliError when the download produces no template files', async () => {
      const origin = trackTemp();
      const cacheDir = path.join(trackTemp(), 'cache');

      const download: TemplateDownloader = vi.fn(async () => ({}));

      const loader = new SchematicLoader({ originDir: origin, cacheDir, download });

      await expect(loader.render('service', 'X', 'x')).rejects.toThrow(/no template files/i);
    });

    it('wraps download failures in a CliError', async () => {
      const origin = trackTemp();
      const cacheDir = path.join(trackTemp(), 'cache');

      const download: TemplateDownloader = vi.fn(async () => {
        throw new Error('network down');
      });

      const loader = new SchematicLoader({ originDir: origin, cacheDir, download });

      const error = await loader.render('service', 'X', 'x').catch((e: unknown) => e);
      expect(error).toBeInstanceOf(CliError);
      expect((error as Error).message).toContain('Failed to download schematic templates');
    });

    it('allows retrying after a transient download failure', async () => {
      const origin = trackTemp();
      const cacheDir = path.join(trackTemp(), 'cache');

      const download: TemplateDownloader = vi
        .fn<TemplateDownloader>()
        .mockImplementationOnce(async () => {
          throw new Error('flaky');
        })
        .mockImplementationOnce(async (_source, opts) => {
          writeSchematicTemplate(opts.dir, 'service', 'ok');
          return {};
        });

      const loader = new SchematicLoader({ originDir: origin, cacheDir, download });

      await expect(loader.render('service', 'X', 'x')).rejects.toBeInstanceOf(CliError);
      await expect(loader.render('service', 'X', 'x')).resolves.toBe('ok');
      expect(download).toHaveBeenCalledTimes(2);
    });
  });

  it('reuses an already-populated cache directory without re-downloading', async () => {
    const origin = trackTemp();
    const cacheDir = path.join(trackTemp(), 'cache');
    writeSchematicTemplate(cacheDir, 'embed', '{{pascalName}}Embed');

    const download = vi.fn();
    const loader = new SchematicLoader({
      originDir: origin,
      cacheDir,
      download: download as TemplateDownloader,
    });

    await expect(loader.render('embed', 'Welcome', 'welcome')).resolves.toBe('WelcomeEmbed');
    expect(download).not.toHaveBeenCalled();
    // sanity check the cache really held the template
    expect(readdirSync(cacheDir)).toContain('embed.txt');
  });
});
