import type { Dirent } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { downloadTemplate } from 'giget';
import { TemplateConstant } from '../constants';
import type { DatabaseTemplateOptions, EnvKeySpec, OrmEntry } from '../interfaces';

export class DatabaseTemplateService {
  async loadIndex(monorepoRoot: string | null): Promise<ReadonlyArray<OrmEntry>> {
    let raw: string;
    if (monorepoRoot) {
      raw = await readFile(path.join(monorepoRoot, 'templates', 'database', 'index.json'), 'utf8');
    } else {
      const res = await fetch(TemplateConstant.DB_INDEX_RAW_URL);
      if (!res.ok) throw new Error(`Failed to fetch database index: HTTP ${res.status}`);
      raw = await res.text();
    }
    const data = JSON.parse(raw) as { orms: Array<OrmEntry> };
    return data.orms;
  }

  async install(options: DatabaseTemplateOptions): Promise<void> {
    const tmpDir = await mkdtemp(path.join(tmpdir(), 'spraxium-db-'));
    try {
      await this.fetchTemplate(tmpDir, options.orm, options.db, options.monorepoRoot);
      await this.placeModuleFiles(tmpDir, options);
      await this.placeRootFiles(tmpDir, options);
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  }

  private async fetchTemplate(
    destDir: string,
    orm: string,
    db: string,
    monorepoRoot: string | null,
  ): Promise<void> {
    const templateId = `database/${orm}/${db}`;
    if (monorepoRoot) {
      const localPath = path.join(monorepoRoot, 'templates', templateId);
      await cp(localPath, destDir, { recursive: true });
    } else {
      await downloadTemplate(`${TemplateConstant.GIGET_ORG}/${templateId}`, {
        dir: destDir,
        forceClean: false,
      });
    }
  }

  private async placeModuleFiles(tmpDir: string, opts: DatabaseTemplateOptions): Promise<void> {
    const srcDir = path.join(tmpDir, 'module');
    const destDir = path.join(opts.srcDir, 'modules', opts.moduleName);
    await this.copyDir(srcDir, destDir, opts, true);
  }

  private async placeRootFiles(tmpDir: string, opts: DatabaseTemplateOptions): Promise<void> {
    const srcDir = path.join(tmpDir, 'root');
    await this.copyDir(srcDir, opts.projectRoot, opts, false);
  }

  private async copyDir(
    srcDir: string,
    destDir: string,
    opts: DatabaseTemplateOptions,
    renameEntrypoints: boolean,
  ): Promise<void> {
    let entries: Array<Dirent<string>>;
    try {
      entries = await readdir(srcDir, { withFileTypes: true });
    } catch {
      return;
    }

    await mkdir(destDir, { recursive: true });

    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      if (entry.isDirectory()) {
        await this.copyDir(srcPath, path.join(destDir, entry.name), opts, false);
      } else {
        // app.env.ts is patched separately via patchAppEnv, never overwrite it
        if (entry.name === 'app.env.ts') continue;
        const destName = renameEntrypoints ? this.resolveFileName(entry.name, opts.moduleName) : entry.name;
        const content = await readFile(srcPath, 'utf8');
        await writeFile(path.join(destDir, destName), this.applyTokens(content, opts), 'utf8');
      }
    }
  }

  private resolveFileName(name: string, moduleName: string): string {
    if (name === 'module.ts') return `${moduleName}.module.ts`;
    if (name === 'service.ts') return `${moduleName}.service.ts`;
    return name;
  }

  private applyTokens(content: string, opts: DatabaseTemplateOptions): string {
    return content
      .replaceAll('{{MODULE_NAME}}', opts.moduleName)
      .replaceAll('{{PASCAL_NAME}}', opts.pascalName);
  }

  async patchAppEnv(srcDir: string, envKeys: ReadonlyArray<EnvKeySpec>): Promise<boolean> {
    const filePath = path.join(srcDir, 'app.env.ts');
    let content: string;
    try {
      content = await readFile(filePath, 'utf8');
    } catch {
      return false;
    }

    const keysToAdd = envKeys.filter(
      (spec) => !content.includes(`@Env('${spec.key}')`) && !content.includes(`@Env("${spec.key}")`),
    );

    if (keysToAdd.length === 0) return false;

    for (const spec of keysToAdd) {
      const defaultPart = spec.default !== undefined ? `, { default: '${spec.default}' }` : '';
      const field = `\n  @Env('${spec.key}'${defaultPart})\n  @IsString()\n  ${spec.key}!: string;\n`;
      const lastBrace = content.lastIndexOf('}');
      if (lastBrace === -1) continue;
      content = content.slice(0, lastBrace) + field + content.slice(lastBrace);
    }

    content = this.ensureEnvImports(content, ['Env', 'IsString']);
    await writeFile(filePath, content, 'utf8');
    return true;
  }

  private ensureEnvImports(content: string, names: string[]): string {
    const importRegex = /^import\s*\{([^}]+)\}\s*from\s*['"]\.?\/?@?spraxium\/env['"]\s*;?/m;
    const match = importRegex.exec(content);
    if (!match) return content;

    const existing = match[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const toAdd = names.filter((n) => !existing.includes(n));
    if (toAdd.length === 0) return content;

    const merged = [...existing, ...toAdd].join(', ');
    return content.replace(match[0], match[0].replace(match[1], ` ${merged} `));
  }
}
