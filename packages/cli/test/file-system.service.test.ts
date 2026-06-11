import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../src/service/file-system.service';

describe('FileSystem', () => {
  const tempDirs: Array<string> = [];

  function tempDir(): string {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'sprax-fs-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes a generated file to the correct destination, creating parent directories', async () => {
    const fs = new FileSystem();
    const root = tempDir();
    const dest = path.join(root, 'src', 'modules', 'user', 'services', 'user.service.ts');

    await fs.writeFile(dest, 'export class UserService {}');

    expect(readFileSync(dest, 'utf8')).toBe('export class UserService {}');
  });

  it('reports existence of files correctly', async () => {
    const fs = new FileSystem();
    const root = tempDir();
    const file = path.join(root, 'a.ts');

    expect(await fs.exists(file)).toBe(false);
    writeFileSync(file, '', 'utf8');
    expect(await fs.exists(file)).toBe(true);
  });

  it('lists only directories', async () => {
    const fs = new FileSystem();
    const root = tempDir();
    await fs.writeFile(path.join(root, 'one', 'index.ts'), '');
    await fs.writeFile(path.join(root, 'two', 'index.ts'), '');
    writeFileSync(path.join(root, 'file.ts'), '', 'utf8');

    const dirs = await fs.listDirectories(root);

    expect(dirs.sort()).toEqual(['one', 'two']);
  });

  it('returns an empty list for a non-existent directory', async () => {
    const fs = new FileSystem();

    expect(await fs.listDirectories(path.join(tempDir(), 'missing'))).toEqual([]);
  });

  it('finds a file by suffix', async () => {
    const fs = new FileSystem();
    const root = tempDir();
    writeFileSync(path.join(root, 'user.module.ts'), '', 'utf8');
    writeFileSync(path.join(root, 'user.service.ts'), '', 'utf8');

    const found = await fs.findFileWithSuffix(root, '.module.ts');

    expect(found).toBe(path.join(root, 'user.module.ts'));
  });
});
