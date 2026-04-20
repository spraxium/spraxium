import { Module } from '@spraxium/common';
import { ComponentsModule } from '@spraxium/components';
import { ButtonsModule } from './modules/buttons/buttons.module';
import { FlowModule } from './modules/flow/components/flow.module';
import { ModalModule } from './modules/modal/modal.module';
import { SelectsModule } from './modules/selects/selects.module';
import { V2Module } from './modules/v2/v2.module';

@Module({
  imports: [ComponentsModule, ButtonsModule, SelectsModule, ModalModule, FlowModule, V2Module],
})
export class AppModule {}
