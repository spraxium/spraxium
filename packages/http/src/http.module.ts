import { Global, Module } from '@spraxium/common';
import { HttpServer } from './service/http-server.service';

@Global()
@Module({
  providers: [HttpServer],
  exports: [HttpServer],
})
export class HttpModule {}
