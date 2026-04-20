import { Logger } from '@spraxium/core';
import { OnSignal, SignalListener } from '@spraxium/signal';
import type { SignalEnvelope } from '@spraxium/signal';
import {
  type ConfigResetPayload,
  type ConfigUpdatePayload,
  configResetSchema,
  configUpdateSchema,
} from '../schemas/config-update.schema';

@SignalListener()
export class ConfigUpdateListener {
  private readonly logger = new Logger(ConfigUpdateListener.name);

  @OnSignal('config.update', {
    schema: configUpdateSchema,
  })
  async onConfigUpdate(payload: ConfigUpdatePayload, envelope: SignalEnvelope): Promise<void> {
    this.logger.info(`Config update received - key: "${payload.key}" in guild ${envelope.guildId}`);
  }

  @OnSignal('config.reset', {
    schema: configResetSchema,
  })
  async onConfigReset(payload: ConfigResetPayload, envelope: SignalEnvelope): Promise<void> {
    this.logger.warn(`Config reset requested - scope: ${payload.scope} (guild: ${envelope.guildId})`);
  }
}
