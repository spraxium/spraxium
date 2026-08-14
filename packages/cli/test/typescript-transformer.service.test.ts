import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import {
  resolveTypeScriptSpecifier,
  runtimeModuleFormat,
  transformTypeScript,
} from '../src/service/typescript-transformer.service';

const tempDirectories: Array<string> = [];

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('TypeScript transformer', () => {
  it('emits legacy decorator metadata without loading the TypeScript compiler', () => {
    const source = `
      function Injectable(): ClassDecorator { return () => undefined; }
      class Dependency {}
      @Injectable()
      class Service {
        constructor(readonly dependency: Dependency) {}
      }
      export { Service };
    `;

    const output = transformTypeScript(source, moduleFile('service.ts'));

    expect(output).toContain('design:paramtypes');
    expect(output).not.toContain('readonly dependency: Dependency');
  });

  it('resolves extensionless and JavaScript-style imports to TypeScript files', () => {
    const directory = createTempPackage();
    const importer = path.join(directory, 'src', 'main.ts');
    const dependency = path.join(directory, 'src', 'dependency.ts');
    mkdirSync(path.dirname(importer), { recursive: true });
    writeFileSync(importer, '', 'utf8');
    writeFileSync(dependency, 'export const value = 1;', 'utf8');
    const parentUrl = pathToFileURL(importer).href;

    expect(resolveTypeScriptSpecifier('./dependency', parentUrl)).toBe(pathToFileURL(dependency).href);
    expect(resolveTypeScriptSpecifier('./dependency.js', parentUrl)).toBe(pathToFileURL(dependency).href);
  });

  it('resolves generated Spraxium filenames containing dots', () => {
    const directory = createTempPackage();
    const importer = path.join(directory, 'src', 'main.ts');
    const environment = path.join(directory, 'src', 'app.env.ts');
    mkdirSync(path.dirname(importer), { recursive: true });
    writeFileSync(importer, '', 'utf8');
    writeFileSync(environment, 'export class AppEnv {}', 'utf8');

    expect(resolveTypeScriptSpecifier('./app.env', pathToFileURL(importer).href)).toBe(
      pathToFileURL(environment).href,
    );
  });

  it('honors ESM package type and explicit CTS modules', () => {
    const directory = createTempPackage();

    expect(runtimeModuleFormat(path.join(directory, 'src', 'main.ts'))).toBe('module');
    expect(runtimeModuleFormat(path.join(directory, 'src', 'legacy.cts'))).toBe('commonjs');
  });
});

function createTempPackage(): string {
  const directory = mkdtempSync(path.join(tmpdir(), 'spraxium-cli-loader-'));
  tempDirectories.push(directory);
  writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');
  return directory;
}

function moduleFile(name: string): string {
  const directory = createTempPackage();
  return path.join(directory, name);
}
