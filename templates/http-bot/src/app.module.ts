import { Module } from '@spraxium/common';
import { HttpModule } from '@spraxium/http';

@Module({
  imports: [HttpModule],
})
export class AppModule {}
