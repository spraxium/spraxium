import { readFileSync } from 'node:fs';
import type { LoadHookSync, ResolveHookSync } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
  isTypeScriptUrl,
  resolveTypeScriptSpecifier,
  runtimeModuleFormat,
  transformTypeScript,
} from './typescript-transformer.service';

export const resolveTypeScript: ResolveHookSync = (specifier, context, nextResolve) => {
  try {
    return nextResolve(specifier, context);
  } catch (error) {
    const url = resolveTypeScriptSpecifier(specifier, context.parentURL);
    if (!url) throw error;
    return { url, format: runtimeModuleFormat(fileURLToPath(url)), shortCircuit: true };
  }
};

export const loadTypeScript: LoadHookSync = (url, context, nextLoad) => {
  if (!isTypeScriptUrl(url)) return nextLoad(url, context);

  const filename = fileURLToPath(url);
  return {
    format: runtimeModuleFormat(filename),
    source: transformTypeScript(readFileSync(filename, 'utf8'), filename),
    shortCircuit: true,
  };
};
