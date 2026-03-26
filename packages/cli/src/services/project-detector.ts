import fs from 'node:fs';
import path from 'node:path';

export class ProjectDetector {
  findMainTs(cwd = process.cwd()): string | null {
    const candidates = [path.join(cwd, 'src', 'main.ts'), path.join(cwd, 'main.ts')];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return null;
  }

  findSrcDir(cwd = process.cwd()): string | null {
    const candidate = path.join(cwd, 'src');
    return fs.existsSync(candidate) ? candidate : null;
  }
}
