import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import helmet from "helmet";
import express, { type Express } from "express";
import { AppModule } from "./app.module";

const server: Express = express();

let appPromise: Promise<void> | null = null;

async function initializeApp() {
  if (appPromise) {
    return appPromise;
  }

  appPromise = (async () => {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      {
        bufferLogs: true,
      },
    );

    const config = app.get(ConfigService);
    const logger = new Logger("Bootstrap");

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

    logger.log("NestJS application initialized");
  })();

  return appPromise;
}

// Local development only
if (!process.env.VERCEL) {
  initializeApp()
    .then(() => {
      const port = Number(process.env.PORT) || 3001;

      server.listen(port, () => {
        console.log(
          `Server running at http://localhost:${port}`,
        );
      });
    })
    .catch((error) => {
      console.error("Failed to start application", error);
      process.exit(1);
    });
}

// Vercel Function
export default async function handler(
  req: express.Request,
  res: express.Response,
) {
  try {
    await initializeApp();

    server(req, res);
  } catch (error) {
    console.error("Failed to initialize NestJS", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Failed to initialize server",
      });
    }
  }
}
