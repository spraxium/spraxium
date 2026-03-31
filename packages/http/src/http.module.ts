import { Global, Module } from '@spraxium/common';
import { HttpServer } from './services/http-server.service';

@Global()
@Module({
  providers: [HttpServer],
  exports: [HttpServer],
})
export class HttpModule {}
