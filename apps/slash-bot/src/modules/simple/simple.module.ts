import { Module } from '@spraxium/common';
import { ColorCommand } from './commands/color.command';
import { DigestCommand } from './commands/digest.command';
import { InspectCommand } from './commands/inspect.command';
import { PingCommand } from './commands/ping.command';
import { ReportCommand } from './commands/report.command';
import { WeatherCommand } from './commands/weather.command';
import { ColorHandler } from './handlers/color-command.handler';
import { DigestHandler } from './handlers/digest-command.handler';
import { InspectHandler } from './handlers/inspect-command.handler';
import { PingHandler } from './handlers/ping-command.handler';
import { ReportHandler } from './handlers/report-command.handler';
import { WeatherHandler } from './handlers/weather-command.handler';

@Module({
  commands: [PingCommand, InspectCommand, ColorCommand, ReportCommand, WeatherCommand, DigestCommand],
  handlers: [PingHandler, InspectHandler, ColorHandler, ReportHandler, WeatherHandler, DigestHandler],
})
export class SimpleModule {}
