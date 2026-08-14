import { readFile } from 'node:fs/promises';
import type { LoadHook, ResolveHook } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
  isTypeScriptUrl,
  resolveTypeScriptSpecifier,
  runtimeModuleFormat,
  transformTypeScript,
} from './service/typescript-transformer.service';

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const url = resolveTypeScriptSpecifier(specifier, context.parentURL);
    if (!url) throw error;
    return { url, format: runtimeModuleFormat(fileURLToPath(url)), shortCircuit: true };
  }
};

export const load: LoadHook = async (url, context, nextLoad) => {
  if (!isTypeScriptUrl(url)) return nextLoad(url, context);

  const filename = fileURLToPath(url);
  return {
    format: runtimeModuleFormat(filename),
    source: transformTypeScript(await readFile(filename, 'utf8'), filename),
    shortCircuit: true,
  };
};
