import { Module } from "@nestjs/common";

import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { StorageService } from "./storage.service";

import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    PaymentController,
  ],

  providers: [
    PaymentService,
    StorageService,
  ],

  exports: [
    PaymentService,
  ],
})
export class PaymentModule {}
