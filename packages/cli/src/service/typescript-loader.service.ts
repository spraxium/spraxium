import * as moduleApi from 'node:module';
import { loadTypeScript, resolveTypeScript } from './typescript-hooks.service';

let registered = false;

export function registerTypeScriptLoader(): void {
  if (registered) return;

  if (typeof moduleApi.registerHooks === 'function') {
    moduleApi.registerHooks({
      resolve: resolveTypeScript,
      load: loadTypeScript,
    });
  } else {
    moduleApi.register(new URL('./swc.hooks.js', import.meta.url), import.meta.url);
  }

  registered = true;
}
