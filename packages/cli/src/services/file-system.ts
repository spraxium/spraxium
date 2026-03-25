import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export class FileSystem {
  async writeFile(dest: string, content: string): Promise<void> {
    await this.ensureDir(path.dirname(dest));
    await writeFile(dest, content, 'utf8');
  }

  async ensureDir(dir: string): Promise<void> {
    const { mkdir } = await import('node:fs/promises');
    await mkdir(dir, { recursive: true });
  }

  async exists(p: string): Promise<boolean> {
    try {
      await stat(p);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(p: string): Promise<string> {
    return readFile(p, 'utf8');
  }

  async listDirectories(dir: string): Promise<Array<string>> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  }

  async findFileWithSuffix(dir: string, suffix: string): Promise<string | null> {
    try {
      const entries = await readdir(dir);
      const found = entries.find((e) => e.endsWith(suffix));
      return found ? path.join(dir, found) : null;
    } catch {
      return null;
    }
  }
}
