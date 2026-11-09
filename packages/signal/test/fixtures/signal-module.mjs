import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { Module } from '@spraxium/common';
import { ConfigStore, ModuleLoader } from '@spraxium/core';
import { Client } from 'discord.js';

const { SignalModule, SignalListener, OnSignal, defineSignal, createSignalPayload } = await import(
  pathToFileURL(process.argv[2]).href
);
const received = [];

class ConfigListener {
  update(payload, envelope) {
    received.push({ payload, event: envelope.event });
  }
}

SignalListener()(ConfigListener);
OnSignal('config.update')(
  ConfigListener.prototype,
  'update',
  Object.getOwnPropertyDescriptor(ConfigListener.prototype, 'update'),
);

class AppModule {}

Module({ imports: [SignalModule], providers: [ConfigListener] })(AppModule);

const config = {
  channelId: 'signal-channel',
  allowedWebhookIds: ['signal-webhook'],
  hmacSecret: 'signal-di-regression-test',
};
const client = new Client({ intents: [] });
const loader = new ModuleLoader();
const scanners = ModuleLoader.instanceScanners.size;
const listeners = client.listenerCount('messageCreate');
ConfigStore.load({ plugins: [defineSignal(config)] });

try {
  loader.load(AppModule, client);
  await loader.runBootHooks();
  assert.equal(client.listenerCount('messageCreate'), listeners + 1);
  assert.equal(ModuleLoader.instanceScanners.size, scanners + 1);

  const payload = { prefix: '!' };
  const envelope = createSignalPayload('config.update', 'signal-guild', payload);
  const signature = createHmac('sha256', config.hmacSecret)
    .update(`${envelope.nonce}.${envelope.sentAt}.${JSON.stringify(payload)}`)
    .digest('hex');
  client.emit('messageCreate', {
    id: envelope.nonce,
    channelId: config.channelId,
    webhookId: 'signal-webhook',
    content: JSON.stringify({ ...envelope, signature }),
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(received, [{ payload, event: 'config.update' }]);
} finally {
  await loader.runShutdownHooks();
  ConfigStore.reset();
  await client.destroy();
}

assert.equal(client.listenerCount('messageCreate'), listeners);
assert.equal(ModuleLoader.instanceScanners.size, scanners);
console.log('Signal boot, dispatch and shutdown verified.');
