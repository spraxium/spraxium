import { Global, Module } from '@spraxium/common';
import { ModuleLoader } from '@spraxium/core';
import { ContextService } from '../context';
import { createInstanceScanner } from '../dispatcher';
import { ComponentLifecycle } from './service/components.lifecycle';

ModuleLoader.instanceScanners.add(createInstanceScanner());

@Global()
@Module({
  providers: [ComponentLifecycle, ContextService],
  exports: [ContextService],
})
export class ComponentsModule {}
