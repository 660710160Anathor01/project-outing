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

        companions: companions.map((companion) => ({
          name: companion.name,
          phone: companion.phone ?? "",
          relationship: companion.relationship ?? "",
        })),

        travelOption: dto.travelOption,
        carShare: dto.carShare ?? false,
        emptySeats: dto.emptySeats ?? 0,

        address: dto.address ?? null,
        note: dto.note ?? null,

        status: "PENDING",
      },
    });
  }

  async findAll() {
    return this.prisma.form.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
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

  async findByRegistrationNumber(name: string, phone: string) {
    return this.prisma.form.findFirst({
      where: {
        name,
        phone,
        status: {
          not: "CANCELLED",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateByRegistrationNumber(
    name: string,
    phone: string,
    dto: UpdateRegistrationDto,
  ) {
    const registration =
      await this.findByRegistrationNumber(name, phone);
  
    return this.update(registration?.id ?? "", dto);
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

        ...(dto.locationId !== undefined && {
          locationId: dto.locationId,
        }),


        ...(dto.companions !== undefined && {
          companions: dto.companions.map((companion) => ({
            name: companion.name,
            phone: companion.phone ?? "",
            relationship: companion.relationship ?? "",
          })),
        }),

        ...(dto.travelOption !== undefined && {
          travelOption: dto.travelOption,
        }),

        ...(dto.carShare !== undefined && {
          carShare: dto.carShare,
        }),

        ...(dto.emptySeats !== undefined && {
          emptySeats: dto.emptySeats,
        }),

        ...(dto.address !== undefined && {
          address: dto.address ?? null,
        }),

        ...(dto.note !== undefined && {
          note: dto.note ?? null,
        }),
      },
    });
  }

  async cancelByRegistrationNumber(
    name: string,
    phone: string,
  ) {
    const registration = await this.prisma.form.findFirst({
      where: {
        name,
        phone,
      },
    });
  
    if (!registration) {
      throw new NotFoundException(
        "Registration not found",
      );
    }
  
    return this.prisma.form.update({
      where: {
        id: registration.id,
      },
      data: {
        status: "CANCELLED",
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
