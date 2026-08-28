import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

// Adjust this import path to wherever your PrismaModule actually lives.
import { PrismaModule } from "../prisma/prisma.module";
import { LoginController } from "./login.controller";
import { LoginService } from "./login.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, JwtAuthGuard],
  exports: [LoginService, JwtAuthGuard],
})
export class LoginModule {}