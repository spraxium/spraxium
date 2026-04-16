import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { cp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { downloadTemplate } from 'giget';
import { TemplateConstant } from '../constants';

export class SchematicLoader {
  private templatesDir: string | null = null;

  render(schematicName: string, pascalName: string, kebabName: string): string {
    const dir = this.resolveTemplatesDir();
    const templatePath = path.join(dir, `${schematicName}.txt`);

    if (!existsSync(templatePath)) {
      throw new Error(`Template not found for schematic "${schematicName}" at ${templatePath}`);
    }

    const template = readFileSync(templatePath, 'utf-8');
    return template.replaceAll('{{pascalName}}', pascalName).replaceAll('{{kebabName}}', kebabName);
  }

  async sync(): Promise<void> {
    const localDir = this.findLocalTemplatesDir();
    if (localDir) {
      this.templatesDir = localDir;
      return;
    }

    const cacheDir = path.join(os.tmpdir(), 'spraxium-schematics');
    if (existsSync(cacheDir)) await rm(cacheDir, { recursive: true });
    mkdirSync(cacheDir, { recursive: true });

    await downloadTemplate(TemplateConstant.SCHEMATICS_GIGET_SOURCE, {
      dir: cacheDir,
      forceClean: false,
    });
    this.templatesDir = cacheDir;
  }

  async syncFromLocal(monorepoRoot: string): Promise<void> {
    const localDir = path.join(monorepoRoot, 'templates', 'schematics');
    if (!existsSync(localDir)) {
      throw new Error(`Schematics directory not found at ${localDir}`);
    }

    const cacheDir = path.join(os.tmpdir(), 'spraxium-schematics');
    if (existsSync(cacheDir)) await rm(cacheDir, { recursive: true });

    await cp(localDir, cacheDir, { recursive: true });
    this.templatesDir = cacheDir;
  }

  private resolveTemplatesDir(): string {
    if (this.templatesDir) return this.templatesDir;

    const localDir = this.findLocalTemplatesDir();
    if (localDir) {
      this.templatesDir = localDir;
      return localDir;
    }

    throw new Error(
      'Schematic templates not found. Run "spraxium generate" inside a Spraxium project or monorepo.',
    );
  }

  private findLocalTemplatesDir(): string | null {
    let dir = path.dirname(fileURLToPath(import.meta.url));

    for (let i = 0; i < 10; i++) {
      const candidate = path.join(dir, 'templates', 'schematics');
      if (existsSync(candidate) && this.hasTemplateFiles(candidate)) return candidate;

      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }

    return null;
  }

  private hasTemplateFiles(dir: string): boolean {
    try {
      return readdirSync(dir).some((f) => f.endsWith('.txt'));
    } catch {
      return false;
    }
  }
}
