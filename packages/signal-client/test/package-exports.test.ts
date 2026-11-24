import { execFile } from 'node:child_process';
import { copyFile, mkdtemp, realpath, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'tsdown';
import { afterAll, beforeAll, expect, it } from 'vitest';

const execute = promisify(execFile);
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const prefix = 'spraxium-signal-client-';
let temporary: string;
let directory: string | undefined;

beforeAll(async () => {
  temporary = await realpath(tmpdir());
  directory = await mkdtemp(join(temporary, prefix));
  await build({
    config: join(packageRoot, 'tsdown.config.ts'),
    cwd: packageRoot,
    outDir: join(directory, 'dist'),
    silent: true,
  });
  const fixture = join(packageRoot, 'test', 'fixtures', 'typed-consumer.cts');
  await Promise.all([
    copyFile(join(packageRoot, 'package.json'), join(directory, 'package.json')),
    copyFile(
      join(packageRoot, 'test', 'fixtures', 'check-package-exports.mjs'),
      join(directory, 'check.mjs'),
    ),
    copyFile(fixture, join(directory, 'consumer.cts')),
    copyFile(fixture, join(directory, 'consumer.mts')),
  ]);
}, 60_000);

afterAll(async () => {
  if (!directory) return;
  if (dirname(directory) !== temporary || !basename(directory).startsWith(prefix)) {
    throw new Error('Unexpected Signal Client test directory.');
  }
  await rm(directory, { recursive: true, force: true });
});

it('loads the same public classes through native CommonJS and ESM', async () => {
  if (!directory) throw new Error('Signal Client build is unavailable.');
  await expect(
    execute(process.execPath, ['--no-require-module', 'check.mjs'], { cwd: directory, timeout: 10_000 }),
  ).resolves.toBeDefined();
}, 15_000);

it('resolves the published types for both module formats with Node16 resolution', async () => {
  if (!directory) throw new Error('Signal Client build is unavailable.');
  const compiler = require.resolve('typescript/bin/tsc');
  await expect(
    execute(
      process.execPath,
      [
        compiler,
        '--noEmit',
        '--strict',
        '--module',
        'Node16',
        '--target',
        'ES2022',
        'consumer.cts',
        'consumer.mts',
      ],
      { cwd: directory, timeout: 15_000 },
    ),
  ).resolves.toBeDefined();
}, 20_000);
