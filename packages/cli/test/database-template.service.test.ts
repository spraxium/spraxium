import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseTemplateService } from '../src/service/database-template.service';

describe('DatabaseTemplateService environment patching', () => {
  const directories: Array<string> = [];
  const service = new DatabaseTemplateService();

  afterEach(async () => {
    for (const directory of directories.splice(0)) {
      expect(directory.startsWith(path.join(os.tmpdir(), 'spraxium-db-test-'))).toBe(true);
      await rm(directory, { recursive: true, force: true });
    }
  });

  async function fixture(source: string, layout = 'env'): Promise<string> {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'spraxium-db-test-'));
    directories.push(directory);
    await mkdir(path.join(directory, layout), { recursive: true });
    await writeFile(path.join(directory, layout, 'app.env.ts'), source);
    return directory;
  }

  it('does not duplicate SQLite environment fields that have defaults', async () => {
    const directory = await fixture(
      "import { EnvSchema, SpraxiumBaseEnv } from '@spraxium/env';\n@EnvSchema()\nexport class AppEnv extends SpraxiumBaseEnv {}",
    );
    const keys = [{ key: 'DATABASE_PATH', default: './dev.db' }];
    expect(await service.patchAppEnv(directory, keys)).toBe(true);
    const once = await readFile(path.join(directory, 'env', 'app.env.ts'), 'utf8');
    expect(await service.patchAppEnv(directory, keys)).toBe(false);
    expect(await readFile(path.join(directory, 'env', 'app.env.ts'), 'utf8')).toBe(once);
    expect(once).toContain('DATABASE_PATH!: string');
  });

  it('preserves existing values and recognizes whitespace and both quote styles', async () => {
    const source = `import { Env, IsString } from '@spraxium/env';
export class AppEnv {
  @Env( 'DATABASE_URL', { default: 'keep-me' })
  @IsString()
  DATABASE_URL!: string;
}`;
    const directory = await fixture(source);
    expect(await service.patchAppEnv(directory, [{ key: 'DATABASE_URL' }])).toBe(false);
    expect(await readFile(path.join(directory, 'env', 'app.env.ts'), 'utf8')).toBe(source);
  });

  it('adds missing imports and safely quotes a default path', async () => {
    const directory = await fixture('export class AppEnv {}');
    const defaultPath = "C:\\data\\user's.db";
    await service.patchAppEnv(directory, [{ key: 'DATABASE_PATH', default: defaultPath }]);
    const patched = await readFile(path.join(directory, 'env', 'app.env.ts'), 'utf8');
    expect(patched).toContain("import { Env, IsString } from '@spraxium/env';");
    expect(patched).toContain(JSON.stringify(defaultPath));
  });

  it('keeps patching legacy projects without moving their schema', async () => {
    const directory = await fixture('export class AppEnv {}', '');
    expect(await service.patchAppEnv(directory, [{ key: 'DATABASE_URL' }])).toBe(true);
    expect(await readFile(path.join(directory, 'app.env.ts'), 'utf8')).toContain('DATABASE_URL!: string');
  });

  it('prefers env/app.env.ts when a legacy schema is also present', async () => {
    const directory = await fixture('export class AppEnv {}');
    const legacy = 'export class LegacyEnv {}';
    await writeFile(path.join(directory, 'app.env.ts'), legacy);
    await service.patchAppEnv(directory, [{ key: 'DATABASE_URL' }]);
    expect(await readFile(path.join(directory, 'env', 'app.env.ts'), 'utf8')).toContain(
      'DATABASE_URL!: string',
    );
    expect(await readFile(path.join(directory, 'app.env.ts'), 'utf8')).toBe(legacy);
  });

  it.each(['env', ''])(
    'generates imports for all database templates using schema layout "%s"',
    async (layout) => {
      const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
      const orms = await service.loadIndex(repository);
      for (const orm of orms) {
        for (const database of orm.databases) {
          const source = 'export class AppEnv {}';
          const directory = await fixture(source, layout);
          await service.install({
            orm: orm.id,
            db: database.id,
            moduleName: 'storage',
            pascalName: 'Storage',
            srcDir: directory,
            projectRoot: directory,
            monorepoRoot: repository,
          });
          const generated = await readFile(
            path.join(directory, 'modules/storage/storage.service.ts'),
            'utf8',
          );
          const expected = layout ? '../../env/app.env' : '../../app.env';
          expect(generated, `${orm.id}/${database.id}`).toContain(`from '${expected}'`);
          expect(await readFile(path.join(directory, layout, 'app.env.ts'), 'utf8')).toBe(source);
        }
      }
    },
  );
});

describe('database template dependency contracts', () => {
  const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const templates = path.join(repository, 'templates/database');
  const basePackages = [
    '@spraxium/common',
    '@spraxium/core',
    '@spraxium/env',
    '@spraxium/logger',
    'discord.js',
  ];

  async function sources(directory: string): Promise<Array<string>> {
    const result: Array<string> = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) result.push(...(await sources(file)));
      else if (entry.name.endsWith('.ts')) result.push(await readFile(file, 'utf8'));
    }
    return result;
  }

  it('declares every external package imported by all 13 database templates', async () => {
    const orms = await new DatabaseTemplateService().loadIndex(repository);
    let combinations = 0;
    for (const orm of orms) {
      for (const db of orm.databases) {
        combinations++;
        const declared = new Set(
          [...basePackages, ...db.runtimePackages, ...db.devPackages].map((pkg) =>
            pkg.replace(/@[^@/]+$/, ''),
          ),
        );
        for (const source of await sources(path.join(templates, orm.id, db.id))) {
          for (const match of source.matchAll(/\bfrom\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g)) {
            const specifier = match[1] ?? match[2];
            if (specifier.startsWith('.') || specifier.startsWith('node:')) continue;
            const pkg = specifier
              .split('/')
              .slice(0, specifier.startsWith('@') ? 2 : 1)
              .join('/');
            expect(declared.has(pkg), `${orm.id}/${db.id} imports undeclared package ${pkg}`).toBe(true);
          }
        }
      }
    }
    expect(combinations).toBe(13);
  });

  it('keeps Prisma CLI, client and adapters on the same stable version range', async () => {
    const orms = await new DatabaseTemplateService().loadIndex(repository);
    const prisma = orms.find((orm) => orm.id === 'prisma');
    expect(prisma).toBeDefined();
    for (const db of prisma?.databases ?? []) {
      const packages = [...db.runtimePackages, ...db.devPackages].filter(
        (pkg) => pkg.startsWith('@prisma/') || pkg.startsWith('prisma@'),
      );
      const ranges = packages.map((pkg) => pkg.slice(pkg.lastIndexOf('@') + 1));
      expect(new Set(ranges).size).toBe(1);
      expect(ranges[0]).toMatch(/^[~^]?\d+\.\d+\.\d+$/);
    }
  });
});
