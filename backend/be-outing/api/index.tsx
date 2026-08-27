import { Handler } from '@codegenie/serverless-express';
import { createApp } from '../src/bootstrap';

let cachedHandler: Handler;

async function bootstrap() {
  const app = await createApp();

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();

  return require('@codegenie/serverless-express')({
    app: expressApp,
  });
}

export default async function handler(req: any, res: any) {
  cachedHandler ??= await bootstrap();

  return cachedHandler(req, res);
}
