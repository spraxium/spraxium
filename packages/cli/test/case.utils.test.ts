import { describe, expect, it } from 'vitest';
import { toKebabCase, toPascalCase } from '../src/utils/case.utils';

describe('toPascalCase', () => {
  it('capitalizes a single lowercase word', () => {
    expect(toPascalCase('module')).toBe('Module');
  });

  it('converts kebab-case to PascalCase', () => {
    expect(toPascalCase('my-module')).toBe('MyModule');
  });

  it('converts snake_case to PascalCase', () => {
    expect(toPascalCase('my_module')).toBe('MyModule');
  });

  it('handles multiple separators', () => {
    expect(toPascalCase('some-long-module-name')).toBe('SomeLongModuleName');
  });

  it('preserves already-PascalCase input', () => {
    expect(toPascalCase('MyModule')).toBe('MyModule');
  });

  it('capitalizes first letter when input starts lowercase without separators', () => {
    expect(toPascalCase('mymodule')).toBe('Mymodule');
  });

  it('handles mixed kebab and snake separators', () => {
    expect(toPascalCase('my-module_name')).toBe('MyModuleName');
  });
});

describe('toKebabCase', () => {
  it('lowercases a single word', () => {
    expect(toKebabCase('module')).toBe('module');
  });

  it('converts PascalCase to kebab-case', () => {
    expect(toKebabCase('MyModule')).toBe('my-module');
  });

  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('myModule')).toBe('my-module');
  });

  it('converts snake_case to kebab-case', () => {
    expect(toKebabCase('my_module')).toBe('my-module');
  });

  it('handles consecutive uppercase acronyms (e.g. HTTPServer)', () => {
    expect(toKebabCase('HTTPServer')).toBe('http-server');
  });

  it('handles multi-word PascalCase', () => {
    expect(toKebabCase('SomeLongModuleName')).toBe('some-long-module-name');
  });

  it('converts spaces to dashes', () => {
    expect(toKebabCase('my module')).toBe('my-module');
  });

  it('preserves already-kebab-case input', () => {
    expect(toKebabCase('my-module')).toBe('my-module');
  });
});
