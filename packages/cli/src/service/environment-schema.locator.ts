import { stat } from 'node:fs/promises';
import path from 'node:path';

export class EnvironmentSchemaLocator {
  /** Finds the application schema in the env directory or the legacy source root. */
  async findAppEnv(srcDir: string): Promise<string | null> {
    const candidates = [path.join(srcDir, 'env', 'app.env.ts'), path.join(srcDir, 'app.env.ts')];
    for (const candidate of candidates) {
      try {
        if ((await stat(candidate)).isFile()) return candidate;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
    return null;
  }
}
