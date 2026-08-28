import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLocationDto) {
    const existing = await this.prisma.location.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Location "${dto.name}" already exists`,
      );
    }

    return this.prisma.location.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        address: dto.address,
        beds: dto.beds,
        residentCapacity: dto.residentCapacity,
        carparkCapacity: dto.carparkCapacity,
        mapUrl: dto.mapUrl ?? null,
        sourceUrl: dto.sourceUrl ?? null,
        imageUrl: dto.imageUrl ?? [],
      },
    });
  }

  async findAll() {
    return this.prisma.location.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException(
        `Location ${id} was not found`,
      );
    }

    return location;
  }

  async update(id: string, dto: UpdateLocationDto) {
    const existing = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Location ${id} was not found`,
      );
    }

    if (dto.name !== undefined && dto.name !== existing.name) {
      const duplicate = await this.prisma.location.findUnique({
        where: {
          name: dto.name,
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Location "${dto.name}" already exists`,
        );
      }
    }

    return this.prisma.location.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.description !== undefined && {
          description: dto.description ?? null,
        }),

        ...(dto.address !== undefined && {
          address: dto.address,
        }),

        ...(dto.beds !== undefined && {
          beds: dto.beds,
        }),

        ...(dto.residentCapacity !== undefined && {
          residentCapacity: dto.residentCapacity,
        }),

        ...(dto.carparkCapacity !== undefined && {
          carparkCapacity: dto.carparkCapacity,
        }),

        ...(dto.mapUrl !== undefined && {
          mapUrl: dto.mapUrl ?? null,
        }),

        ...(dto.sourceUrl !== undefined && {
          sourceUrl: dto.sourceUrl ?? null,
        }),

        ...(dto.imageUrl !== undefined && {
          imageUrl: dto.imageUrl,
        }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Location ${id} was not found`,
      );
    }

    return this.prisma.location.delete({
      where: { id },
    });
  }
}
