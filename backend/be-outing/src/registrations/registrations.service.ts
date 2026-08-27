import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRegistrationDto } from "./dto/create-registration.dto";
import { UpdateRegistrationDto } from "./dto/update-registration.dto";

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRegistrationDto) {
    const companions = dto.companions ?? [];

    const registrationNumber =
      `OUT-${new Date().getFullYear()}-${Date.now()}`;

      return this.prisma.form.create({
        data: {
          registrationNumber,
          name: dto.name,
          phone: dto.phone,
          lineId: dto.lineId ?? null,
          locationId: dto.locationId,
          follower: companions.length,
          companions: companions.map((companion) => ({
            name: companion.name,
            phone: companion.phone ?? "",
            relationship: companion.relationship ?? "",
          })),
          travelOption: dto.travelOption,
          note: dto.note ?? null,
          status: "PENDING",
        },
      });
      
  }
  

  async findAll() {
    return this.prisma.form.findMany();
  }

  async findOne(id: string) {
    const registration = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException(
        `Registration ${id} was not found`,
      );
    }

    return registration;
  }

  async update(id: string, dto: UpdateRegistrationDto) {
    const existing = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Registration ${id} was not found`,
      );
    }

    return this.prisma.form.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.phone !== undefined && {
          phone: dto.phone,
        }),

        ...(dto.lineId !== undefined && {
          lineId: dto.lineId,
        }),



        ...(dto.companions !== undefined && {
          follower: dto.companions.length,
          companions: dto.companions.map((companion) => ({
            name: companion.name,
            phone: companion.phone ?? "",
            relationship: companion.relationship ?? "",
          })),
        }),

        ...(dto.note !== undefined && {
          note: dto.note ?? null,
        }),

      },
    });
  }

  async cancel(id: string) {
    const existing = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Registration ${id} was not found`,
      );
    }

    return this.prisma.form.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });
  }
}
