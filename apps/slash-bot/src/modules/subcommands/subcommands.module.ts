import { Module } from '@spraxium/common';
import { MathCommand } from './commands/math.command';
import { ServerCommand } from './commands/server.command';
import { MathAddHandler } from './handlers/math-add-command.handler';
import { MathMultiplyHandler } from './handlers/math-multiply-command.handler';
import { MathSubtractHandler } from './handlers/math-subtract-command.handler';
import { ServerIconHandler } from './handlers/server-icon-command.handler';
import { ServerInfoHandler } from './handlers/server-info-command.handler';
import { ServerSettingsLanguageHandler } from './handlers/server-settings-language-command.handler';
import { ServerSettingsPrefixHandler } from './handlers/server-settings-prefix-command.handler';

@Module({
  commands: [MathCommand, ServerCommand],
  handlers: [
    MathAddHandler,
    MathSubtractHandler,
    MathMultiplyHandler,
    ServerInfoHandler,
    ServerIconHandler,
    ServerSettingsPrefixHandler,
    ServerSettingsLanguageHandler,
  ],
})
export class SubcommandsModule {}
