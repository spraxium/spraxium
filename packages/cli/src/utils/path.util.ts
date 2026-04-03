import path from 'node:path';

export function toForwardSlash(p: string): string {
  return p.replace(/\\/g, '/');
}

export function buildRelativeImport(fromFile: string, toFile: string): string {
  const fromDir = path.dirname(fromFile);
  let rel = toForwardSlash(path.relative(fromDir, toFile)).replace(/\.ts$/, '');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}
