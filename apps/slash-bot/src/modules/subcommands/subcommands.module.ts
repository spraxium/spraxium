import { Module } from '@spraxium/common';
import { MathCommand } from './commands/math.command';
import { ServerCommand } from './commands/server.command';
import { MathAddHandler } from './handlers/math-add.handler';
import { MathMultiplyHandler } from './handlers/math-multiply.handler';
import { MathSubtractHandler } from './handlers/math-subtract.handler';
import { ServerIconHandler } from './handlers/server-icon.handler';
import { ServerInfoHandler } from './handlers/server-info.handler';
import { ServerSettingsLanguageHandler } from './handlers/server-settings-language.handler';
import { ServerSettingsPrefixHandler } from './handlers/server-settings-prefix.handler';

@Module({
  commands: [MathCommand, ServerCommand],
  handlers: [
    // /math flat subcommands
    MathAddHandler,
    MathSubtractHandler,
    MathMultiplyHandler,

    // /server flat subcommands
    ServerInfoHandler,
    ServerIconHandler,

    // /server settings <group> subcommands
    ServerSettingsPrefixHandler,
    ServerSettingsLanguageHandler,
  ],
})
export class SubcommandsModule {}
