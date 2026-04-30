import { Module } from '@spraxium/common';
import { ColorCommand } from './commands/color.command';
import { DigestCommand } from './commands/digest.command';
import { InspectCommand } from './commands/inspect.command';
import { PingCommand } from './commands/ping.command';
import { ReportCommand } from './commands/report.command';
import { WeatherCommand } from './commands/weather.command';
import { ColorHandler } from './handlers/color.handler';
import { DigestHandler } from './handlers/digest.handler';
import { InspectHandler } from './handlers/inspect.handler';
import { PingHandler } from './handlers/ping.handler';
import { ReportHandler } from './handlers/report.handler';
import { WeatherHandler } from './handlers/weather.handler';

@Module({
  commands: [PingCommand, InspectCommand, ColorCommand, ReportCommand, WeatherCommand, DigestCommand],
  handlers: [PingHandler, InspectHandler, ColorHandler, ReportHandler, WeatherHandler, DigestHandler],
})
export class SimpleModule {}
