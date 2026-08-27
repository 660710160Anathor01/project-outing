import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import serverlessExpress from "@codegenie/serverless-express";
import express from "express";
import helmet from "helmet";
import { AppModule } from "../src/app.module";

const server = express();

let cachedHandler: ReturnType<typeof serverlessExpress> | null = null;

async function bootstrap() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    {
      bufferLogs: true,
    },
  );

  const config = app.get(ConfigService);

  app.setGlobalPrefix("api");

  app.use(helmet());

  const allowedOrigins = config
    .get<string>("CORS_ORIGINS", "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: false,
    maxAge: 600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  await app.init();

  cachedHandler = serverlessExpress({
    app: server,
  });

  return cachedHandler;
}

export default async function handler(req: any, res: any) {
  const handler = await bootstrap();

  return handler(req, res);
}
