import { Module } from '@spraxium/common';
import { AutocompleteModule } from './modules/autocomplete/autocomplete.module';
import { ProtectionModule } from './modules/protection/protection.module';
import { SimpleModule } from './modules/simple/simple.module';
import { SubcommandsModule } from './modules/subcommands/subcommands.module';

@Module({
  imports: [SimpleModule, AutocompleteModule, SubcommandsModule, ProtectionModule],
})
export class AppModule {}
