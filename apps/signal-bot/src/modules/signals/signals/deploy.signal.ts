import { Logger } from '@spraxium/logger';
import { OnSignal, SignalListener } from '@spraxium/signal';
import type { SignalEnvelope } from '@spraxium/signal';
import { type DeployFailedPayload, deployFailedSchema } from '../schemas/deploy-failed.schema';
import { type DeployCompletedPayload, deployCompletedSchema } from '../schemas/deployment-completed.schema';

@SignalListener()
export class DeployListener {
  private readonly logger = new Logger(DeployListener.name);

  @OnSignal('deploy.completed', {
    schema: deployCompletedSchema,
  })
  async onDeployCompleted(payload: DeployCompletedPayload, envelope: SignalEnvelope): Promise<void> {
    this.logger.info(
      `Deploy completed - v${payload.version} to ${payload.environment}${
        payload.deployedBy ? ` by ${payload.deployedBy}` : ''
      } (guild: ${envelope.guildId})`,
    );
  }

  @OnSignal('deploy.failed', {
    schema: deployFailedSchema,
  })
  async onDeployFailed(payload: DeployFailedPayload, envelope: SignalEnvelope): Promise<void> {
    this.logger.error(`Deploy FAILED - v${payload.version}: ${payload.reason} (guild: ${envelope.guildId})`);
  }
}
