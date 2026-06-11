import { existsSync, readdirSync } from 'node:fs';
import { mkdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { downloadTemplate } from 'giget';
import { TemplateConstant } from '../constants';
import { CliError } from '../errors';

const TEMPLATE_EXTENSION = '.txt';

/**
 * Downloads a template archive into the given directory.
 *
 * Matches the relevant subset of giget's `downloadTemplate` signature so it can
 * be substituted in tests without performing real network access.
 */
export type TemplateDownloader = (
  source: string,
  options: { dir: string; forceClean?: boolean },
) => Promise<unknown>;

export interface SchematicLoaderOptions {
  /** Directory used as the starting point for local monorepo resolution. */
  readonly originDir?: string;
  /** Directory schematic templates are cached/downloaded into. */
  readonly cacheDir?: string;
  /** giget source the templates are fetched from when not available locally. */
  readonly source?: string;
  /** Download implementation. Defaults to giget's `downloadTemplate`. */
  readonly download?: TemplateDownloader;
}

/**
 * Resolves and renders schematic templates.
 *
 * Templates are resolved with a local-first strategy: when running inside the
 * Spraxium monorepo the bundled `templates/schematics` directory is used, which
 * keeps local development offline-friendly. For installed-package usage (the
 * common case for end users) templates are downloaded from GitHub via giget and
 * cached on disk, so generation never depends on local monorepo paths.
 */
export class SchematicLoader {
  private readonly originDir: string;
  private readonly cacheDir: string;
  private readonly source: string;
  private readonly download: TemplateDownloader;

  private resolvedDir: string | null = null;
  private resolving: Promise<string> | null = null;

  constructor(options: SchematicLoaderOptions = {}) {
    this.originDir = options.originDir ?? path.dirname(fileURLToPath(import.meta.url));
    this.cacheDir = options.cacheDir ?? path.join(os.tmpdir(), TemplateConstant.SCHEMATICS_CACHE_DIR);
    this.source = options.source ?? TemplateConstant.SCHEMATICS_GIGET_SOURCE;
    this.download = options.download ?? downloadTemplate;
  }

  async render(schematicName: string, pascalName: string, kebabName: string): Promise<string> {
    const dir = await this.ensureTemplatesDir();
    const templatePath = path.join(dir, `${schematicName}${TEMPLATE_EXTENSION}`);

    if (!existsSync(templatePath)) {
      throw new CliError(
        `No template found for schematic "${schematicName}". The schematic templates may be outdated or incomplete — try again, or report this if the problem persists.`,
      );
    }

    const template = await readFile(templatePath, 'utf8');
    return template.replaceAll('{{pascalName}}', pascalName).replaceAll('{{kebabName}}', kebabName);
  }

  private async ensureTemplatesDir(): Promise<string> {
    if (this.resolvedDir) return this.resolvedDir;
    if (!this.resolving) this.resolving = this.resolveTemplatesDir();

    try {
      this.resolvedDir = await this.resolving;
      return this.resolvedDir;
    } catch (error) {
      // Allow a later call to retry after a transient failure (e.g. network).
      this.resolving = null;
      throw error;
    }
  }

  private async resolveTemplatesDir(): Promise<string> {
    const localDir = this.findLocalTemplatesDir();
    if (localDir) return localDir;

    return this.downloadTemplates();
  }

  private async downloadTemplates(): Promise<string> {
    if (this.hasTemplateFiles(this.cacheDir)) return this.cacheDir;

    await rm(this.cacheDir, { recursive: true, force: true });
    await mkdir(this.cacheDir, { recursive: true });

    try {
      await this.download(this.source, { dir: this.cacheDir, forceClean: true });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new CliError(
        `Failed to download schematic templates from "${this.source}". ` +
          `Check your network connection and try again.\n${reason}`,
      );
    }

    if (!this.hasTemplateFiles(this.cacheDir)) {
      throw new CliError(
        'Schematic templates were downloaded but no template files were found. The remote template repository may be unavailable.',
      );
    }

    return this.cacheDir;
  }

  private findLocalTemplatesDir(): string | null {
    let dir = this.originDir;

    for (let depth = 0; depth < 10; depth++) {
      const candidate = path.join(dir, 'templates', 'schematics');
      if (this.hasTemplateFiles(candidate)) return candidate;

      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }

    return null;
  }

  private hasTemplateFiles(dir: string): boolean {
    try {
      return readdirSync(dir).some((file) => file.endsWith(TEMPLATE_EXTENSION));
    } catch {
      return false;
    }
  }
}
