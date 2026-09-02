import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { Multer } from "multer";
import { StorageService } from "./storage.service";
import { PrismaService } from "../prisma/prisma.service";

import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { CreatePaymentCoreDto } from "./dto/create-paymentCore.dto";
import { UpdatePaymentCoreDto } from "./dto/update-paymentCore.dto";

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}
  

  /* =====================================================
     PAYMENT CORE
  ===================================================== */

  async createPaymentCore(
    dto: CreatePaymentCoreDto,
  ) {
    await this.prisma.paymentCore.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return this.prisma.paymentCore.create({
      data: {
        name: dto.name,
        amountPerPerson: dto.amountPerPerson,
        qrCodeUrl: dto.qrCodeUrl,
        isActive: true,
      },
    });
  }

  /* =====================================================
     GET ACTIVE PAYMENT CORE
  ===================================================== */

  async getActivePaymentCore() {
    return this.prisma.paymentCore.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /* =====================================================
     GET ALL PAYMENT CORE
  ===================================================== */

  async getPaymentCores() {
    return this.prisma.paymentCore.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /* =====================================================
     UPDATE PAYMENT CORE
  ===================================================== */

  async updatePaymentCore(
    id: string,
    dto: UpdatePaymentCoreDto,
  ) {
    const paymentCore =
      await this.prisma.paymentCore.findUnique({
        where: {
          id,
        },
      });
  
    if (!paymentCore) {
      throw new NotFoundException(
        "Payment Core not found",
      );
    }
  
    return this.prisma.paymentCore.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        amountPerPerson: dto.amountPerPerson,
        qrCodeUrl: dto.qrCodeUrl ?? null,
      },
    });
  }
  

  /* =====================================================
     CREATE PAYMENT HISTORY
  ===================================================== */

  async createPaymentHistory(
    dto: CreatePaymentDto,
  ) {
    const form =
      await this.prisma.form.findUnique({
        where: {
          id: dto.formId,
        },
      });

    if (!form) {
      throw new NotFoundException(
        "Registration not found",
      );
    }

    const paymentCore =
      await this.prisma.paymentCore.findFirst({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!paymentCore) {
      throw new NotFoundException(
        "No active payment configuration",
      );
    }

    const companions =
      Array.isArray(form.companions)
        ? form.companions
        : [];

    const peopleCount =
      1 + companions.length;

    const amount =
      paymentCore.amountPerPerson *
      peopleCount;

    return this.prisma.paymentHistory.create({
      data: {
        formId: form.id,
        paymentCoreId: paymentCore.id,
        amount,
        peopleCount,
        slipUrl: dto.slipUrl ?? null,
        status: "PENDING",
      },

      include: {
        form: true,
        paymentCore: true,
      },
    });
  }

  /* =====================================================
     GET ALL PAYMENT HISTORY
  ===================================================== */

  async getPaymentHistories() {
    return this.prisma.paymentHistory.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        form: true,
        paymentCore: true,
      },
    });
  }

  /* =====================================================
     GET PAYMENT HISTORY BY ID
  ===================================================== */

  async getPaymentHistory(
    id: string,
  ) {
    const payment =
      await this.prisma.paymentHistory.findUnique({
        where: {
          id,
        },

        include: {
          form: true,
          paymentCore: true,
        },
      });

    if (!payment) {
      throw new NotFoundException(
        "Payment history not found",
      );
    }

    return payment;
  }

  /* =====================================================
     GET PAYMENT HISTORY BY FORM
  ===================================================== */

  async findByFormId(
    formId: string,
  ) {
    return this.prisma.paymentHistory.findMany({
      where: {
        formId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        paymentCore: true,
      },
    });
  }

  /* =====================================================
     GET REGISTRATION PAYMENT
  ===================================================== */

  async getRegistrationPayment(
    formId: string,
  ) {
    const form =
      await this.prisma.form.findUnique({
        where: {
          id: formId,
        },
      });

    if (!form) {
      throw new NotFoundException(
        "Registration not found",
      );
    }

    if (form.status === "CANCELLED") {
      throw new NotFoundException(
        "Registration has been cancelled",
      );
    }

    const paymentCore =
      await this.prisma.paymentCore.findFirst({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!paymentCore) {
      throw new NotFoundException(
        "No active payment configuration",
      );
    }

    const companions =
      Array.isArray(form.companions)
        ? form.companions
        : [];

    const peopleCount =
      1 + companions.length;

    const amount =
      paymentCore.amountPerPerson *
      peopleCount;

    const paymentHistory =
      await this.prisma.paymentHistory.findFirst({
        where: {
          formId: form.id,
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          paymentCore: true,
        },
      });

    return {
      registration: {
        id: form.id,
        registrationNumber:
          form.registrationNumber,
        name: form.name,
        phone: form.phone,
      },

      payment: paymentHistory
        ? {
            id: paymentHistory.id,
            amount: paymentHistory.amount,
            peopleCount:
              paymentHistory.peopleCount,
            status: paymentHistory.status,
            slipUrl:
              paymentHistory.slipUrl,
            paidAt:
              paymentHistory.paidAt,
            verifiedAt:
              paymentHistory.verifiedAt,
          }
        : {
            id: null,
            amount,
            peopleCount,
            status: "PENDING",
            slipUrl: null,
            paidAt: null,
            verifiedAt: null,
          },

      paymentCore: {
        id: paymentCore.id,
        name: paymentCore.name,
        amountPerPerson:
          paymentCore.amountPerPerson,
        qrCodeUrl:
          paymentCore.qrCodeUrl,
      },
    };
  }

  /* =====================================================
     UPLOAD PAYMENT SLIP
  ===================================================== */

  async uploadSlip(
    paymentId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        "Payment slip is required",
      );
    }
  
    const payment =
      await this.prisma.paymentHistory.findUnique({
        where: {
          id: paymentId,
        },
      });
  
    if (!payment) {
      throw new NotFoundException(
        "Payment history not found",
      );
    }
  
    // 1. Upload slip ก่อน
    const uploaded =
      await this.storageService.uploadPaymentSlip(
        file,
        paymentId,
      );
  
    // 2. ถ้า upload สำเร็จ → update payment + form
    const result =
      await this.prisma.$transaction(async (tx) => {
        const updatedPayment =
          await tx.paymentHistory.update({
            where: {
              id: paymentId,
            },
            data: {
              slipUrl: uploaded.key,
              status: "PENDING",
              paidAt: new Date(),
            },
            include: {
              form: true,
              paymentCore: true,
            },
          });
  
        await tx.form.update({
          where: {
            id: payment.formId,
          },
          data: {
            status: "PAID",
          },
        });
  
        return updatedPayment;
      });
  
    return result;
  }
  

  
  /* =====================================================
     UPDATE PAYMENT HISTORY
  ===================================================== */

  async updatePaymentHistory(
    dto: UpdatePaymentDto,
  ) {
    const payment =
      await this.prisma.paymentHistory.findUnique({
        where: {
          id: dto.paymentId,
        },
      });
  
    if (!payment) {
      throw new NotFoundException(
        "Payment history not found",
      );
    }
  
    const isPaid = dto.status === "PAID";
  
    return this.prisma.$transaction(async (tx) => {
      const updatedPayment =
        await tx.paymentHistory.update({
          where: {
            id: dto.paymentId,
          },
  
          data: {
            ...(dto.status !== undefined && {
              status: dto.status,
            }),
  
            ...(isPaid && {
              verifiedAt: new Date(),
            }),
          },
  
          include: {
            form: true,
            paymentCore: true,
          },
        });
  
      if (isPaid) {
        await tx.form.update({
          where: {
            id: payment.formId,
          },
  
          data: {
            status: "PAID",
          },
        });
      }
  
      return updatedPayment;
    });
  }  
  
}
