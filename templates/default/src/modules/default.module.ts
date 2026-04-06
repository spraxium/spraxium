import { Module } from '@spraxium/core';

@Module({
  imports: [], // <- Your imported modules go here
  commands: [], // <- Your commands go here
  listeners: [], // <- Your listeners go here
  providers: [], // <- Your providers go here (services, guards, etc.)
  exports: [] // <- Your exports go here (services, guards, etc.)
})
export class DefaultModule {}