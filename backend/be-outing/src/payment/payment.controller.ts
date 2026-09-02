import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseInterceptors,
  } from "@nestjs/common";
  
  import { FileInterceptor } from "@nestjs/platform-express";  
  
  import { PaymentService } from "./payment.service";
  
  import { CreatePaymentDto } from "./dto/create-payment.dto";
  import { UpdatePaymentDto } from "./dto/update-payment.dto";
  
  import { CreatePaymentCoreDto } from "./dto/create-paymentCore.dto";
  import { UpdatePaymentCoreDto } from "./dto/update-paymentCore.dto";
  
  @Controller("payment")
  export class PaymentController {
    constructor(
      private readonly paymentService: PaymentService,
    ) {}
  
    @Post("core")
    createPaymentCore(
      @Body() dto: CreatePaymentCoreDto,
    ) {
      return this.paymentService.createPaymentCore(dto);
    }

    @Patch("core/:id")
    updatePaymentCore(
    @Param("id") id: string,
    @Body() dto: UpdatePaymentCoreDto,
    ) {
    return this.paymentService.updatePaymentCore(
        id,
        dto,
    );
    }
  
    // @Patch("core")
    // updatePaymentCore(
    //   @Body() dto: UpdatePaymentCoreDto,
    // ) {
    //   return this.paymentService.updatePaymentCore(dto);
    // }
  
    @Get("core/active")
    getActivePaymentCore() {
      return this.paymentService.getActivePaymentCore();
    }
  
    @Get("registration/:id")
    getRegistrationPayment(
      @Param("id") id: string,
    ) {
      return this.paymentService.getRegistrationPayment(id);
    }
  
    @Post("history")
    createPaymentHistory(
      @Body() dto: CreatePaymentDto,
    ) {
      return this.paymentService.createPaymentHistory(dto);
    }
  
    @Patch("history")
    updatePaymentHistory(
      @Body() dto: UpdatePaymentDto,
    ) {
      return this.paymentService.updatePaymentHistory(dto);
    }
  
    @Get("history")
    getPaymentHistories() {
      return this.paymentService.getPaymentHistories();
    }
  
    @Get("history/:id")
    getPaymentHistory(
      @Param("id") id: string,
    ) {
      return this.paymentService.getPaymentHistory(id);
    }
  
    /*
     * Upload Payment Slip
     */
    @Post("history/:id/slip")
    @UseInterceptors(FileInterceptor("file"))
    uploadSlip(
    @Param("id") paymentId: string,
    @UploadedFile() file: Express.Multer.File,
    ) {
    return this.paymentService.uploadSlip(
        paymentId,
        file,
    );
    }

  }
  