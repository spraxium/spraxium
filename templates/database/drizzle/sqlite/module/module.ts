import { Module } from '@spraxium/common';
import { {{PASCAL_NAME}}Service } from './{{MODULE_NAME}}.service';

@Module({
  providers: [{{PASCAL_NAME}}Service],
  exports: [{{PASCAL_NAME}}Service],
})
export class {{PASCAL_NAME}}Module {}
