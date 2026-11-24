import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { basename } from 'node:path';

const require = createRequire(import.meta.url);
const packageName = '@spraxium/signal-client';
const commonjs = require(packageName);
const esm = await import(packageName);

assert.equal(basename(require.resolve(packageName)), 'index.cjs');
assert.equal(typeof commonjs.SignalClient, 'function');
assert.deepEqual(Object.keys(commonjs).sort(), Object.keys(esm).sort());
for (const [key, value] of Object.entries(commonjs)) {
  assert.equal(esm[key], value);
}
const error = new commonjs.SignalClientError('Example');
assert.ok(error instanceof esm.SignalClientError);
