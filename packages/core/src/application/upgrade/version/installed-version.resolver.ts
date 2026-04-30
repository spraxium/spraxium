import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pkg from '../../../../package.json';

export class InstalledVersionResolver {
  static resolve(packageName: string): string | null {
    if (process.env.SPRAXIUM_MOCK_VERSION) return process.env.SPRAXIUM_MOCK_VERSION;

    if (packageName === pkg.name) return pkg.version;

    try {
      const path = join(process.cwd(), 'node_modules', packageName, 'package.json');
      if (!existsSync(path)) return null;
      const parsed = JSON.parse(readFileSync(path, 'utf8')) as { version?: string };
      return parsed.version ?? null;
    } catch {
      return null;
    }
  }
}
