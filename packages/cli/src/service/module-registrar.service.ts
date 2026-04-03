import path from 'node:path';
import type { FileSystem } from './file-system.service';

export class ModuleRegistrar {
  constructor(private readonly fs: FileSystem) {}

  async register(
    modulePath: string,
    className: string,
    importRelPath: string,
    arrayKey: string,
  ): Promise<boolean> {
    let source = await this.fs.readFile(modulePath);

    if (!source.includes(className)) {
      source = this.addImport(source, className, importRelPath);
    }

    source = this.injectIntoArray(source, className, arrayKey);
    await this.fs.writeFile(modulePath, source);
    return true;
  }

  async findModuleFile(moduleDir: string): Promise<string | null> {
    return this.fs.findFileWithSuffix(moduleDir, '.module.ts');
  }

  private addImport(source: string, className: string, relPath: string): string {
    const importLine = `import { ${className} } from '${relPath}';`;
    const lastIdx = this.findLastImportLine(source);

    if (lastIdx === -1) return `${importLine}\n${source}`;

    const lines = source.split('\n');
    lines.splice(lastIdx + 1, 0, importLine);
    return lines.join('\n');
  }

  private injectIntoArray(source: string, className: string, arrayKey: string): string {
    const escapedKey = arrayKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(${escapedKey}\\s*:\\s*\\[)([^\\]]*)(\\])`, 's');
    const match = pattern.exec(source);
    if (!match) return source;

    const existing = match[2] ?? '';
    const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escapedClass}\\b`).test(existing)) return source;

    const before = match[1] ?? '';
    const after = match[3] ?? '';
    const isMultiline = existing.includes('\n');

    let updated: string;
    if (isMultiline) {
      const indentMatch = existing.match(/\n(\s+)\S/);
      const indent = indentMatch?.[1] ?? '    ';
      const closingMatch = existing.match(/\n(\s*)$/);
      const closing = closingMatch?.[1] ?? '  ';
      const body = existing.replace(/\s*$/, '');
      const normalized = body.endsWith(',') ? body : `${body},`;
      updated = `${normalized}\n${indent}${className},\n${closing}`;
    } else {
      const contents = existing.trim();
      const base = contents.endsWith(',') ? contents.slice(0, -1).trimEnd() : contents;
      updated = base.length === 0 ? className : `${base}, ${className}`;
    }

    const idx = match.index ?? 0;
    return source.slice(0, idx) + before + updated + after + source.slice(idx + match[0].length);
  }

  private findLastImportLine(source: string): number {
    const lines = source.split('\n');
    let last = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^import\s/.test(lines[i] ?? '')) last = i;
    }
    return last;
  }
}
