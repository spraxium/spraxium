import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export class PackageDiscovery {
  private static readonly SCOPE = '@spraxium';

  static discover(): Array<string> {
    const scopeDir = join(process.cwd(), 'node_modules', PackageDiscovery.SCOPE);
    if (!existsSync(scopeDir)) return [];

    try {
      return readdirSync(scopeDir)
        .filter((name) => !name.startsWith('.'))
        .filter((name) => {
          try {
            return statSync(join(scopeDir, name)).isDirectory();
          } catch {
            return false;
          }
        })
        .map((name) => `${PackageDiscovery.SCOPE}/${name}`);
    } catch {
      return [];
    }
  }
}
