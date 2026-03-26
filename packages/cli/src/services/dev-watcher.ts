import fs from 'node:fs';
import path from 'node:path';
import { minimatch } from 'minimatch';
import { RegexConstant, WatcherConstant } from '../constants';
import type { DevWatcherOptions, SpraxiumDevConfig } from '../interfaces';

export class DevWatcher {
  private readonly watchers: Array<fs.FSWatcher> = [];
  private includePatterns: Array<string> = [];
  private excludePatterns: Array<string> = [];
  private reloadingConfig = false;

  constructor(private readonly options: DevWatcherOptions) {
    this.applyConfig(options.initialConfig);
  }

  start(): void {
    this.watchWorkspace();
  }

  close(): void {
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.watchers.length = 0;
  }

  private watchWorkspace(): void {
    const root = this.tryWatch(this.options.cwd, true, (filename) => {
      if (!filename) return;
      this.onFileChange(path.join(this.options.cwd, filename));
    });

    if (!root) {
      this.tryWatch(this.options.cwd, false, (filename) => {
        if (!filename) return;
        this.onFileChange(path.join(this.options.cwd, filename));
      });

      const srcDir = path.resolve(this.options.cwd, 'src');
      if (fs.existsSync(srcDir)) {
        this.tryWatch(srcDir, true, (filename) => {
          if (!filename) return;
          this.onFileChange(path.join(srcDir, filename));
        });
      }
    }
  }

  private tryWatch(
    target: string,
    recursive: boolean,
    onFilename: (filename: string | null) => void,
  ): boolean {
    try {
      const watcher = fs.watch(target, { recursive }, (_event, filename) => {
        onFilename(filename);
      });
      watcher.on('error', () => {});
      this.watchers.push(watcher);
      return true;
    } catch {
      return false;
    }
  }

  private onFileChange(filePath: string): void {
    const relPath = this.toNormalizedPath(filePath);
    if (!relPath) return;

    if (relPath === 'spraxium.config.ts') {
      this.reloadConfig();
    }

    if (this.shouldRestart(relPath)) {
      this.options.onChange(path.resolve(this.options.cwd, relPath));
    }
  }

  private applyConfig(config: SpraxiumDevConfig): void {
    this.includePatterns = (config.include ?? []).map((p) => this.toNormalizedPath(p)).filter(Boolean);
    this.excludePatterns = [...WatcherConstant.DEFAULT_EXCLUDE, ...(config.exclude ?? [])]
      .map((p) => this.toNormalizedPath(p))
      .filter(Boolean);
    this.options.onConfigUpdate?.(config);
  }

  private reloadConfig(): void {
    if (this.reloadingConfig) return;
    this.reloadingConfig = true;

    void this.options.configReader
      .readDevConfig(this.options.cwd)
      .then((nextConfig) => {
        this.applyConfig(nextConfig);
      })
      .finally(() => {
        this.reloadingConfig = false;
      });
  }

  private shouldRestart(relPath: string): boolean {
    for (const pattern of this.excludePatterns) {
      if (this.matchesPattern(relPath, pattern)) return false;
    }

    if (this.includePatterns.length === 0) return true;

    for (const pattern of this.includePatterns) {
      if (this.matchesPattern(relPath, pattern)) return true;
    }

    return false;
  }

  private matchesPattern(relPath: string, pattern: string): boolean {
    if (this.isGlobPattern(pattern)) {
      return minimatch(relPath, pattern, {
        dot: true,
        nocase: process.platform === 'win32',
        windowsPathsNoEscape: true,
      });
    }

    return relPath === pattern || relPath.startsWith(`${pattern}/`);
  }

  private isGlobPattern(value: string): boolean {
    return RegexConstant.GLOB_CHARS.test(value);
  }

  private toNormalizedPath(value: string): string {
    const rel = path.isAbsolute(value) ? path.relative(this.options.cwd, value) : value;
    return rel.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  }
}
