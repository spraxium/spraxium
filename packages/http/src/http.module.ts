import { Global, Module } from '@spraxium/common';
import { HttpServer } from './service/http-server.service';

@Global()
@Module({
  providers: [HttpServer],
  exports: [HttpServer],
})
/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class HttpModule {}
