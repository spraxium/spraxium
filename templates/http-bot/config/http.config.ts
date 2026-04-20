import { defineHttp } from '@spraxium/http';
import { AppHttpModule } from '../src/modules/http/http.module';

export const httpConfig = defineHttp({
  enabled: true,
  port: Number.parseInt(process.env.PORT ?? '3000'),
  host: 'localhost',
  apiKey: process.env.HTTP_API_KEY ?? 'dev-secret',
  sharding: false,
  module: AppHttpModule,
});
