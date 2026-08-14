import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { type Options, transformSync } from '@swc/core';

const TYPESCRIPT_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts']);
const JAVASCRIPT_TO_TYPESCRIPT_EXTENSIONS: Readonly<Record<string, ReadonlyArray<string>>> = {
  '.js': ['.ts', '.tsx'],
  '.jsx': ['.tsx', '.ts'],
  '.mjs': ['.mts', '.ts'],
  '.cjs': ['.cts', '.ts'],
};
const PACKAGE_TYPE_CACHE = new Map<string, 'module' | 'commonjs'>();

export type RuntimeModuleFormat = 'module' | 'commonjs';

export function isTypeScriptUrl(url: string): boolean {
  if (!url.startsWith('file:')) return false;
  return TYPESCRIPT_EXTENSIONS.has(path.extname(new URL(url).pathname).toLowerCase());
}

export function resolveTypeScriptSpecifier(specifier: string, parentUrl?: string): string | null {
  if (!parentUrl || !isLocalSpecifier(specifier)) return null;

  let requestedUrl: URL;
  try {
    requestedUrl = new URL(specifier, parentUrl);
  } catch {
    return null;
  }

  if (requestedUrl.protocol !== 'file:') return null;

  const requestedPath = fileURLToPath(requestedUrl);
  for (const candidate of candidatePaths(requestedPath)) {
    if (!isFile(candidate)) continue;
    const resolved = pathToFileURL(candidate);
    resolved.search = requestedUrl.search;
    resolved.hash = requestedUrl.hash;
    return resolved.href;
  }

  return null;
}

export function runtimeModuleFormat(filename: string): RuntimeModuleFormat {
  const extension = path.extname(filename).toLowerCase();
  if (extension === '.mts') return 'module';
  if (extension === '.cts') return 'commonjs';
  return nearestPackageType(path.dirname(filename));
}

export function transformTypeScript(source: string, filename: string): string {
  const format = runtimeModuleFormat(filename);
  const extension = path.extname(filename).toLowerCase();
  const options: Options = {
    filename,
    sourceMaps: 'inline',
    jsc: {
      target: 'es2022',
      keepClassNames: true,
      parser: {
        syntax: 'typescript',
        tsx: extension === '.tsx',
        decorators: true,
        dynamicImport: true,
      },
      transform: {
        legacyDecorator: true,
        decoratorMetadata: true,
        useDefineForClassFields: false,
      },
    },
    module: {
      type: format === 'commonjs' ? 'commonjs' : 'es6',
    },
  };

  return transformSync(source, options).code;
}

function isLocalSpecifier(specifier: string): boolean {
  return specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('file:');
}

function candidatePaths(requestedPath: string): ReadonlyArray<string> {
  const extension = path.extname(requestedPath).toLowerCase();
  const candidates: Array<string> = [];

  if (TYPESCRIPT_EXTENSIONS.has(extension)) candidates.push(requestedPath);

  const mappedExtensions = JAVASCRIPT_TO_TYPESCRIPT_EXTENSIONS[extension];
  if (mappedExtensions) {
    const stem = requestedPath.slice(0, -extension.length);
    candidates.push(...mappedExtensions.map((candidateExtension) => `${stem}${candidateExtension}`));
  }

  if (!extension || (!TYPESCRIPT_EXTENSIONS.has(extension) && !mappedExtensions)) {
    candidates.push(
      ...[...TYPESCRIPT_EXTENSIONS].map((candidateExtension) => `${requestedPath}${candidateExtension}`),
    );
    candidates.push(
      ...[...TYPESCRIPT_EXTENSIONS].map((candidateExtension) =>
        path.join(requestedPath, `index${candidateExtension}`),
      ),
    );
  }

  return candidates;
}

function isFile(candidate: string): boolean {
  try {
    return existsSync(candidate) && statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function nearestPackageType(startDir: string): RuntimeModuleFormat {
  let currentDir = path.resolve(startDir);
  const visited: Array<string> = [];

  while (true) {
    const cached = PACKAGE_TYPE_CACHE.get(currentDir);
    if (cached) {
      cacheVisited(visited, cached);
      return cached;
    }

    visited.push(currentDir);
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageType = readPackageType(packageJsonPath);
      cacheVisited(visited, packageType);
      return packageType;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      cacheVisited(visited, 'commonjs');
      return 'commonjs';
    }
    currentDir = parentDir;
  }
}

function readPackageType(packageJsonPath: string): RuntimeModuleFormat {
  try {
    const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { type?: unknown };
    return parsed.type === 'module' ? 'module' : 'commonjs';
  } catch {
    return 'commonjs';
  }
}

function cacheVisited(directories: ReadonlyArray<string>, packageType: RuntimeModuleFormat): void {
  for (const directory of directories) PACKAGE_TYPE_CACHE.set(directory, packageType);
}
