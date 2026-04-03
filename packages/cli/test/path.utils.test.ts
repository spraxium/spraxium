import { describe, expect, it } from 'vitest';
import { buildRelativeImport, toForwardSlash } from '../src/utils/path.util';

describe('toForwardSlash', () => {
  it('converts backslashes to forward slashes', () => {
    expect(toForwardSlash('src\\modules\\ping')).toBe('src/modules/ping');
  });

  it('converts mixed separators', () => {
    expect(toForwardSlash('src/modules\\ping\\handler')).toBe('src/modules/ping/handler');
  });

  it('leaves forward-slash-only paths unchanged', () => {
    expect(toForwardSlash('src/modules/ping')).toBe('src/modules/ping');
  });

  it('handles an empty string', () => {
    expect(toForwardSlash('')).toBe('');
  });
});

describe('buildRelativeImport', () => {
  it('builds a relative import from a sibling file', () => {
    const result = buildRelativeImport('src/modules/ping/ping.module.ts', 'src/modules/ping/ping.handler.ts');
    expect(result).toBe('./ping.handler');
  });

  it('builds a relative import to a child directory', () => {
    const result = buildRelativeImport(
      'src/modules/ping/ping.module.ts',
      'src/modules/ping/handlers/slash.handler.ts',
    );
    expect(result).toBe('./handlers/slash.handler');
  });

  it('builds a relative import going up one directory', () => {
    const result = buildRelativeImport('src/modules/ping/ping.module.ts', 'src/modules/shared/constants.ts');
    expect(result).toBe('../shared/constants');
  });

  it('builds a relative import going up multiple directories', () => {
    const result = buildRelativeImport('src/modules/ping/handlers/slash.ts', 'src/shared/utils.ts');
    expect(result).toBe('../../../shared/utils');
  });

  it('always prefixes the result with ./ when pointing to the same directory', () => {
    const result = buildRelativeImport('src/foo/a.ts', 'src/foo/b.ts');
    expect(result.startsWith('./')).toBe(true);
  });

  it('strips the .ts extension from the target path', () => {
    const result = buildRelativeImport('src/foo/a.ts', 'src/foo/b.ts');
    expect(result).not.toContain('.ts');
  });
});
