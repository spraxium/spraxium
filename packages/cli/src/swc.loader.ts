import { register } from 'node:module';

// Register SWC TypeScript loader. Using import.meta.url as parent so
// @swc-node/register resolves from the CLI's own node_modules, not from cwd.
register('@swc-node/register/esm', import.meta.url);
