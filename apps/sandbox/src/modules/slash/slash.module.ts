import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { BanCommand } from './commands/ban.command';
import { ConfigCommand } from './commands/config.command';
import { InfoCommand } from './commands/info.command';
import { LocaleCommand } from './commands/locale.command';
import { PingCommand } from './commands/ping.command';
import { UiDemoCommand } from './commands/ui-demo.command';
import { BanHandler } from './handlers/ban-command.handler';
import { ConfigAutomodHandler } from './handlers/config-automod-command.handler';
import { ConfigLoggingHandler } from './handlers/config-logging-command.handler';
import { ConfigResetHandler } from './handlers/config-reset-command.handler';
import { ConfigViewHandler } from './handlers/config-view-command.handler';
import { ConfigWelcomeChannelHandler } from './handlers/config-welcome-channel-command.handler';
import { ConfigWelcomeMessageHandler } from './handlers/config-welcome-message-command.handler';
import { InfoHandler } from './handlers/info-command.handler';
import { LocaleHandler } from './handlers/locale-command.handler';
import { UiDemoHandler } from './handlers/ui-demo-command.handler';
import { UiDemoModalHandler } from './handlers/ui-demo-modal.handler';
import { PingServiceAutocomplete } from './handlers/ping-service.autocomplete';
import { PingHandler } from './handlers/ping-command.handler';

@Module({
  providers: [ModalService],
  commands: [PingCommand, ConfigCommand, BanCommand, LocaleCommand, InfoCommand, UiDemoCommand],
  handlers: [

    PingHandler,
    PingServiceAutocomplete,

    ConfigViewHandler,
    ConfigResetHandler,

    ConfigAutomodHandler,
    ConfigLoggingHandler,

    ConfigWelcomeChannelHandler,
    ConfigWelcomeMessageHandler,

    BanHandler,

    LocaleHandler,
    InfoHandler,

    UiDemoHandler,
    UiDemoModalHandler,
  ],
})
export class SlashModule {}
