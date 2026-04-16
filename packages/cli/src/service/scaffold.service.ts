import path from 'node:path';
import type { ExtraPackage, ScaffoldOptions } from '../interfaces';
import type { FileSystem } from './file-system.service';
import type { TemplateService } from './template.service';

export class ScaffoldService {
  constructor(
    private readonly templates: TemplateService,
    private readonly fs: FileSystem,
  ) {}

  async scaffold(options: ScaffoldOptions): Promise<void> {
    await this.templates.download(
      options.dir,
      { name: options.name, description: options.description },
      options.template,
      options.monorepoRoot,
    );
    if (options.template === 'default') {
      await this.fs.writeFile(
        path.join(options.dir, 'src', 'app.module.ts'),
        this.renderAppModule(options.extras),
      );
    }
  }

  private renderAppModule(extras: ReadonlyArray<ExtraPackage>): string {
    const withModules = extras.filter((e) => e.module !== null);

    if (withModules.length === 0) {
      return [
        "import { Module } from '@spraxium/common';",
        '',
        '@Module({})',
        'export class AppModule {}',
        '',
      ].join('\n');
    }

    const lines: Array<string> = ["import { Module } from '@spraxium/common';"];
    for (const extra of withModules) {
      lines.push(`import { ${extra.module} } from '${extra.pkg}';`);
    }
    lines.push(
      '',
      '@Module({',
      `  imports: [${withModules.map((e) => e.module).join(', ')}],`,
      '})',
      'export class AppModule {}',
      '',
    );

    return lines.join('\n');
  }
}
