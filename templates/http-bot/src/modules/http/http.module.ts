import { HttpClientModule } from '@spraxium/http';
import { StatusController } from './controllers/status.controller';
import { StatusHttpService } from './services/status-http.service';

@HttpClientModule({
  services: [StatusHttpService],
  controllers: [StatusController],
})
export class AppHttpModule {}
