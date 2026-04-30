import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pkg from '../../../../package.json';

/**
 * Resolves the version of a package as it is currently installed in the user's
 * project, by reading `node_modules/<name>/package.json`.
 *
 * Each Spraxium package may have a different version (independent versioning),
 * so the installed version must be looked up per package — never assumed.
 *
 * The SPRAXIUM_MOCK_VERSION env var overrides every lookup. Used for demo apps.
 */
export class InstalledVersionResolver {
  static resolve(packageName: string): string | null {
    if (process.env.SPRAXIUM_MOCK_VERSION) return process.env.SPRAXIUM_MOCK_VERSION;

    // Self-lookup: the framework knows its own version without disk access.
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
