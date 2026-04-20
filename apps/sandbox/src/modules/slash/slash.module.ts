import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { BanCommand } from './commands/ban.command';
import { ConfigCommand } from './commands/config.command';
import { InfoCommand } from './commands/info.command';
import { LocaleCommand } from './commands/locale.command';
import { PingCommand } from './commands/ping.command';
import { UiDemoCommand } from './commands/ui-demo.command';
import { BanHandler } from './handlers/ban.handler';
import { ConfigAutomodHandler } from './handlers/config-automod.handler';
import { ConfigLoggingHandler } from './handlers/config-logging.handler';
import { ConfigResetHandler } from './handlers/config-reset.handler';
import { ConfigViewHandler } from './handlers/config-view.handler';
import { ConfigWelcomeChannelHandler } from './handlers/config-welcome-channel.handler';
import { ConfigWelcomeMessageHandler } from './handlers/config-welcome-message.handler';
import { InfoHandler } from './handlers/info.handler';
import { LocaleHandler } from './handlers/locale.handler';
import { UiDemoHandler } from './handlers/ui-demo.handler';
import { UiDemoModalHandler } from './handlers/ui-demo-modal.handler';
import { PingServiceAutocomplete } from './handlers/ping-service.autocomplete';
import { PingHandler } from './handlers/ping.handler';

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
