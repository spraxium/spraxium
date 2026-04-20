import { Module } from '@spraxium/common';
import { V2Service } from '@spraxium/components';
import { V2DemoCommand } from './commands/v2-demo.command';
import { V2ClassHandler } from './handlers/v2-class.handler';
import { V2DynamicHandler } from './handlers/v2-dynamic.handler';
import { V2FluentHandler } from './handlers/v2-fluent.handler';

@Module({
  providers: [V2Service],
  commands: [V2DemoCommand],
  handlers: [
    V2FluentHandler,
    V2ClassHandler,
    V2DynamicHandler,
  ],
})
export class V2DemoModule {}
