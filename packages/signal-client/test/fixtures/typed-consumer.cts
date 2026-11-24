import { SignalClient } from '@spraxium/signal-client';
import type { SignalClientConfig } from '@spraxium/signal-client';

const config: SignalClientConfig = {
  webhookUrls: ['https://example.invalid/webhook'],
  hmacSecret: 'fixture-only',
};

export const client: SignalClient = new SignalClient(config);
