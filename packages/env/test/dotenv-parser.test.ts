import { describe, expect, it } from 'vitest';
import { DotEnvParser } from '../src/utils/dotenv.parser';

describe('DotEnvParser.parse — basic values', () => {
  it('parses a simple key=value pair', () => {
    expect(DotEnvParser.parse('PORT=3000')).toEqual({ PORT: '3000' });
  });

  it('parses multiple lines', () => {
    const input = 'HOST=localhost\nPORT=3000\nDEBUG=true';
    expect(DotEnvParser.parse(input)).toEqual({ HOST: 'localhost', PORT: '3000', DEBUG: 'true' });
  });

  it('trims whitespace around the key', () => {
    expect(DotEnvParser.parse('  KEY  =value')).toEqual({ KEY: 'value' });
  });

  it('trims whitespace around the value', () => {
    expect(DotEnvParser.parse('KEY=  value  ')).toEqual({ KEY: 'value' });
  });

  it('allows empty string values', () => {
    expect(DotEnvParser.parse('EMPTY=')).toEqual({ EMPTY: '' });
  });

  it('allows values containing equals signs', () => {
    expect(DotEnvParser.parse('URL=postgres://user:pass@host/db?sslmode=require')).toEqual({
      URL: 'postgres://user:pass@host/db?sslmode=require',
    });
  });
});

describe('DotEnvParser.parse — quoted values', () => {
  it('strips double quotes from a value', () => {
    expect(DotEnvParser.parse('MSG="hello world"')).toEqual({ MSG: 'hello world' });
  });

  it('strips single quotes from a value', () => {
    expect(DotEnvParser.parse("MSG='hello world'")).toEqual({ MSG: 'hello world' });
  });

  it('does not strip mismatched quotes', () => {
    expect(DotEnvParser.parse('MSG="hello\'')).toEqual({ MSG: '"hello\'' });
  });

  it('preserves content inside quotes (including spaces)', () => {
    expect(DotEnvParser.parse('SECRET="  spaces  "')).toEqual({ SECRET: '  spaces  ' });
  });
});

describe('DotEnvParser.parse — comments', () => {
  it('ignores full-line comments starting with #', () => {
    const input = '# This is a comment\nKEY=value';
    expect(DotEnvParser.parse(input)).toEqual({ KEY: 'value' });
  });

  it('strips inline trailing comments from unquoted values', () => {
    expect(DotEnvParser.parse('KEY=value # inline comment')).toEqual({ KEY: 'value' });
  });

  it('does NOT strip inline comments from quoted values', () => {
    expect(DotEnvParser.parse('KEY="value # not a comment"')).toEqual({ KEY: 'value # not a comment' });
  });
});

describe('DotEnvParser.parse — ignored lines', () => {
  it('skips empty lines', () => {
    expect(DotEnvParser.parse('\n\nKEY=value\n\n')).toEqual({ KEY: 'value' });
  });

  it('skips lines without an equals sign', () => {
    expect(DotEnvParser.parse('INVALID_LINE\nKEY=value')).toEqual({ KEY: 'value' });
  });

  it('skips lines where the key is empty (= at position 0)', () => {
    expect(DotEnvParser.parse('=nokey\nKEY=value')).toEqual({ KEY: 'value' });
  });

  it('returns an empty object for blank input', () => {
    expect(DotEnvParser.parse('')).toEqual({});
  });

  it('returns an empty object for only whitespace/comments', () => {
    expect(DotEnvParser.parse('# comment\n   \n')).toEqual({});
  });
});
