import { defineHttp } from '@spraxium/http';
import { SandboxHttpModule } from '../src/modules/http/http.module';

export const httpConfig = defineHttp({
	enabled: true,
	port: 3001,
	host: 'localhost',
	apiKey: process.env.HTTP_API_KEY ?? 'dev-secret',
	sharding: false,
	module: SandboxHttpModule,
});
