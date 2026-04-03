import { Global, Module } from '@spraxium/common';
import { ModuleLoader } from '@spraxium/core';
import { ButtonService } from './components/button';
import { EmbedService } from './components/embed';
import { ModalService } from './components/modal';
import { SelectService } from './components/select';
import { V2Service } from './components/v2';
import { ContextService } from './runtime/context';
import { createInstanceScanner } from './runtime/dispatcher';
import { ComponentLifecycle } from './runtime/lifecycle/components.lifecycle';

ModuleLoader.instanceScanners.add(createInstanceScanner());

const COMPONENT_SERVICES = [ButtonService, SelectService, ModalService, EmbedService, V2Service];

@Global()
@Module({
  providers: [ComponentLifecycle, ContextService, ...COMPONENT_SERVICES],
  exports: [ContextService, ...COMPONENT_SERVICES],
})
export class ComponentsModule {}
