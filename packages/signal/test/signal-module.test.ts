import { execFile } from 'node:child_process';
import { mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'tsdown';
import { afterAll, beforeAll, expect, it } from 'vitest';

const execute = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
let directory: string | undefined;
let temporary: string;

beforeAll(async () => {
  temporary = await realpath(tmpdir());
  directory = await mkdtemp(path.join(temporary, 'spraxium-signal-di-'));
  await build({
    config: path.join(root, 'tsdown.config.ts'),
    cwd: root,
    outDir: directory,
    silent: true,
  });
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({ type: 'module' }));
  await symlink(path.join(root, 'node_modules'), path.join(directory, 'node_modules'), 'junction');
}, 60000);

afterAll(async () => {
  if (!directory) return;
  if (path.dirname(directory) !== temporary || !path.basename(directory).startsWith('spraxium-signal-di-'))
    throw new Error('Unexpected Signal test directory.');
  await rm(directory, { recursive: true, force: true });
});

it('boots the compiled module, delivers a signed signal and releases its listeners', async () => {
  if (!directory) throw new Error('Signal build is unavailable.');
  const result = await execute(
    process.execPath,
    [
      fileURLToPath(new URL('./fixtures/signal-module.mjs', import.meta.url)),
      path.join(directory, 'index.js'),
    ],
    { cwd: root, timeout: 15000 },
  );
  expect(result.stdout).toContain('Signal boot, dispatch and shutdown verified.');
}, 20000);
