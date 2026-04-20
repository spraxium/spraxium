import { Module } from '@spraxium/common';
import { ConfigUpdateListener } from './signals/config-update.signal';
import { DeployListener } from './signals/deploy.signal';

@Module({
  providers: [DeployListener, ConfigUpdateListener],
})
export class SignalsModule {}
