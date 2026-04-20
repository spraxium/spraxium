import { ApiKeyGuard, HttpClientModule, LoggerMiddleware } from '@spraxium/http';
import { StatusController } from './modules/controllers/status.controller';

@HttpClientModule({
  controllers: [StatusController],
  guards: [new ApiKeyGuard(process.env.HTTP_API_KEY ?? 'dev-secret')],
  middleware: [new LoggerMiddleware()],
})
export class AppHttpModule {}
