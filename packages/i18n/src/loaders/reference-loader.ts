import fs from 'node:fs';
import path from 'node:path';
import type { I18nReference } from '../interfaces/i18n-config.interface';
import { LocaleRegistry } from '../registry/locale-registry';
import type { LocaleData } from '../types/locale-data.type';

/**
 * Loads locale files from reference directories.
 *
 * Supports two structures per reference:
 *
 * Flat files:
 *   locales/commands/en-US.json
 *   locales/commands/pt-BR.json
 *
 * Nested directories:
 *   locales/commands/en-US/general.json
 *   locales/commands/en-US/admin.json
 */
export class ReferenceLoader {
  static load(references: Array<I18nReference>, basePath: string): void {
    for (const ref of references) {
      const refPath = path.resolve(basePath, ref.path);

      if (!fs.existsSync(refPath)) {
        throw new Error(`[spraxium/i18n] Reference "${ref.name}" path does not exist: ${refPath}`);
      }

      const locales = ReferenceLoader.readReference(refPath);
      LocaleRegistry.registerReference(ref.name, locales);
    }
  }

  private static readReference(dirPath: string): Record<string, LocaleData> {
    const locales: Record<string, LocaleData> = {};
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        const locale = entry.name.replace('.json', '');
        const filePath = path.join(dirPath, entry.name);
        locales[locale] = ReferenceLoader.readJsonFile(filePath);
      } else if (entry.isDirectory()) {
        const locale = entry.name;
        locales[locale] = ReferenceLoader.readLocaleDir(path.join(dirPath, entry.name));
      }
    }

    return locales;
  }

  private static readLocaleDir(dirPath: string): LocaleData {
    const merged: LocaleData = {};
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.json')) continue;

      const namespace = file.name.replace('.json', '');
      const data = ReferenceLoader.readJsonFile(path.join(dirPath, file.name));
      merged[namespace] = data;
    }

    return merged;
  }

  private static readJsonFile(filePath: string): LocaleData {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as LocaleData;
  }
}
