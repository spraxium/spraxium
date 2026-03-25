import fs from 'node:fs';
import path from 'node:path';
import { RegexConstant } from '../constants';

export class EsmImportFixer {
  fix(dir: string): number {
    let count = 0;

    const walk = (d: string): void => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.name.endsWith('.js')) continue;

        const src = fs.readFileSync(full, 'utf8');
        const patched = src.replace(
          RegexConstant.ESM_IMPORT_SPECIFIER,
          (match: string, prefix: string, quote: string, specifier: string) => {
            if (RegexConstant.HAS_JS_EXTENSION.test(specifier)) return match;

            const from = path.dirname(full);
            if (fs.existsSync(path.resolve(from, `${specifier}.js`))) {
              return `${prefix}${quote}${specifier}.js${quote}`;
            }
            if (fs.existsSync(path.resolve(from, specifier, 'index.js'))) {
              return `${prefix}${quote}${specifier}/index.js${quote}`;
            }
            return match;
          },
        );

        if (patched !== src) {
          fs.writeFileSync(full, patched, 'utf8');
          count++;
        }
      }
    };

    walk(dir);
    return count;
  }

  resolveOutDir(cwd: string): string {
    try {
      const raw = fs.readFileSync(path.join(cwd, 'tsconfig.json'), 'utf8');
      const tsconfig = JSON.parse(raw) as { compilerOptions?: { outDir?: string } };
      const outDir = tsconfig?.compilerOptions?.outDir ?? 'dist';
      return path.resolve(cwd, outDir);
    } catch {
      return path.resolve(cwd, 'dist');
    }
  }
}
