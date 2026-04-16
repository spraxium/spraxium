import { cp, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { downloadTemplate } from 'giget';
import { TemplateConstant } from '../constants';
import type { TemplateTokens } from '../interfaces';

export class TemplateService {
  async download(
    destDir: string,
    tokens: TemplateTokens,
    templateId: string,
    monorepoRoot: string | null,
  ): Promise<void> {
    if (monorepoRoot) {
      await this.copyFromLocal(destDir, monorepoRoot, templateId);
    } else {
      await this.downloadViaGiget(destDir, templateId);
    }
    await this.applyTokensToDir(destDir, tokens);
  }

  private async downloadViaGiget(destDir: string, templateId: string): Promise<void> {
    await downloadTemplate(`${TemplateConstant.GIGET_ORG}/${templateId}`, {
      dir: destDir,
      forceClean: false,
    });
  }

  private async copyFromLocal(destDir: string, monorepoRoot: string, templateId: string): Promise<void> {
    const localPath = path.join(monorepoRoot, 'templates', templateId);
    await cp(localPath, destDir, { recursive: true });
  }

  private async applyTokensToDir(dir: string, tokens: TemplateTokens): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await this.applyTokensToDir(fullPath, tokens);
        } else {
          const content = await readFile(fullPath, 'utf8');
          const replaced = this.applyTokens(content, tokens);
          if (replaced !== content) await writeFile(fullPath, replaced, 'utf8');
        }
      }),
    );
  }

  private applyTokens(content: string, tokens: TemplateTokens): string {
    return content.replaceAll('{{name}}', tokens.name).replaceAll('{{description}}', tokens.description);
  }
}
