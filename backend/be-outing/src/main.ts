import { ConfigService } from '@nestjs/config';
import { createApp } from './bootstrap';

async function bootstrap() {
  const app = await createApp();

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3001);

  await app.listen(port, '0.0.0.0');

  console.log(`API listening on port ${port}`);
}

void bootstrap();
