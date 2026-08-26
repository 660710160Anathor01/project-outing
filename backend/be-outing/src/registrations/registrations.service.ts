import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { RegistrationStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CompanionDto } from './dto/companion.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

const REGISTRATION_INCLUDE = {
  location: true,
  companions: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.RegistrationInclude;

/**
 * Number of times a create is retried when the generated registration number
 * collides with an existing row. The per-year counter makes this practically
 * impossible, but rows inserted out-of-band could desynchronise the counter.
 */
const MAX_NUMBER_ATTEMPTS = 5;

type CarFields = {
  carModel: string | null;
  totalSeats: number | null;
  availableSeats: number | null;
  canTakeOthers: boolean | null;
};

@Injectable()
export class RegistrationsService {
  private readonly logger = new Logger(RegistrationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRegistrationDto) {
    await this.assertLocationExists(dto.locationId);

    const companions = dto.hasCompanions ? (dto.companions ?? []) : [];
    const car = this.resolveCarFields(dto.hasCar, dto);
    const year = new Date().getFullYear();

    for (let attempt = 1; attempt <= MAX_NUMBER_ATTEMPTS; attempt++) {
      const registrationNumber = await this.allocateRegistrationNumber(year);

      try {
        // A nested create is wrapped in an implicit transaction by Prisma, so
        // the registration and its companions are still written atomically.
        return await this.prisma.registration.create({
          data: {
            registrationNumber,
            fullName: dto.fullName,
            department: dto.department ?? null,
            phone: dto.phone,
            lineId: dto.lineId,
            locationId: dto.locationId,
            hasCompanions: dto.hasCompanions,
            hasCar: dto.hasCar,
            ...car,
            foodAllergy: dto.foodAllergy ?? null,
            note: dto.note ?? null,
            status: RegistrationStatus.PENDING,
            companions: {
              create: companions.map((companion) =>
                this.toCompanionCreate(companion),
              ),
            },
          },
          include: REGISTRATION_INCLUDE,
        });
      } catch (error) {
        if (
          this.isRegistrationNumberConflict(error) &&
          attempt < MAX_NUMBER_ATTEMPTS
        ) {
          this.logger.warn(
            `Registration number collision on attempt ${attempt}; retrying.`,
          );
          continue;
        }
        throw error;
      }
    }

    throw new InternalServerErrorException(
      'Could not allocate a unique registration number. Please try again.',
    );
  }

  async findOne(id: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: REGISTRATION_INCLUDE,
    });

    if (!registration) {
      throw new NotFoundException(`Registration ${id} was not found`);
    }
    return registration;
  }

  async update(id: string, dto: UpdateRegistrationDto) {
    const existing = await this.prisma.registration.findUnique({
      where: { id },
      include: { companions: { orderBy: { createdAt: 'asc' } } },
    });

    if (!existing) {
      throw new NotFoundException(`Registration ${id} was not found`);
    }

    if (dto.locationId && dto.locationId !== existing.locationId) {
      await this.assertLocationExists(dto.locationId);
    }

    const hasCompanions = dto.hasCompanions ?? existing.hasCompanions;
    const hasCar = dto.hasCar ?? existing.hasCar;

    // Companions are replaced wholesale when supplied; otherwise the stored set stands.
    const companionsProvided = dto.companions !== undefined;
    const effectiveCompanions: CompanionDto[] = companionsProvided
      ? (dto.companions ?? [])
      : existing.companions.map((companion) => ({
          fullName: companion.fullName,
          phone: companion.phone ?? undefined,
          relationship: companion.relationship ?? undefined,
        }));

    if (hasCompanions && effectiveCompanions.length === 0) {
      throw new BadRequestException(
        'at least one companion is required when hasCompanions is true',
      );
    }

    const car = this.resolveCarFields(hasCar, {
      carModel: dto.carModel ?? existing.carModel ?? undefined,
      totalSeats: dto.totalSeats ?? existing.totalSeats ?? undefined,
      availableSeats:
        dto.availableSeats ?? existing.availableSeats ?? undefined,
      canTakeOthers: dto.canTakeOthers ?? existing.canTakeOthers ?? undefined,
    });

    const shouldReplaceCompanions = companionsProvided || !hasCompanions;

    // deleteMany + create nested in one update is applied in a single implicit
    // transaction, so no interactive transaction (and no held connection) is needed.
    return this.prisma.registration.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.department !== undefined && {
          department: dto.department ?? null,
        }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.lineId !== undefined && { lineId: dto.lineId }),
        ...(dto.locationId !== undefined && { locationId: dto.locationId }),
        ...(dto.foodAllergy !== undefined && {
          foodAllergy: dto.foodAllergy ?? null,
        }),
        ...(dto.note !== undefined && { note: dto.note ?? null }),
        ...(dto.status !== undefined && { status: dto.status }),
        hasCompanions,
        hasCar,
        ...car,
        ...(shouldReplaceCompanions && {
          companions: {
            deleteMany: {},
            create: (hasCompanions ? effectiveCompanions : []).map(
              (companion) => this.toCompanionCreate(companion),
            ),
          },
        }),
      },
      include: REGISTRATION_INCLUDE,
    });
  }

  /** Soft delete: the row is kept and its status becomes CANCELLED. */
  async cancel(id: string) {
    const existing = await this.prisma.registration.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      throw new NotFoundException(`Registration ${id} was not found`);
    }

    if (existing.status === RegistrationStatus.CANCELLED) {
      return this.findOne(id);
    }

    return this.prisma.registration.update({
      where: { id },
      data: { status: RegistrationStatus.CANCELLED },
      include: REGISTRATION_INCLUDE,
    });
  }

  /**
   * Allocates the next sequence value for the given year.
   *
   * The single `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` statement is
   * atomic on its own: PostgreSQL takes a row lock on the counter row, and
   * concurrent callers queue behind it and each read back a distinct value.
   * There is no read-then-write window, so duplicates are impossible.
   *
   * It deliberately runs in its own autocommit statement rather than inside the
   * insert's transaction. Holding the counter lock for the whole insert would
   * serialise every registration on one row and exhaust the connection pool
   * under load (observed as Prisma P2028 during a burst of 80 requests).
   *
   * The trade-off is that a number is consumed even if the subsequent insert
   * fails, which can leave gaps in the sequence. Numbers stay unique, which is
   * what matters for an identifier; gaplessness is not a requirement.
   */
  private async allocateRegistrationNumber(year: number): Promise<string> {
    const rows = await this.prisma.$queryRaw<Array<{ lastNumber: number }>>`
      INSERT INTO "RegistrationSequence" ("year", "lastNumber", "updatedAt")
      VALUES (${year}, 1, NOW())
      ON CONFLICT ("year") DO UPDATE
        SET "lastNumber" = "RegistrationSequence"."lastNumber" + 1,
            "updatedAt" = NOW()
      RETURNING "lastNumber"
    `;

    const next = rows[0]?.lastNumber;
    if (typeof next !== 'number' || !Number.isFinite(next)) {
      throw new InternalServerErrorException(
        'Could not allocate a registration number.',
      );
    }

    return `OUT-${year}-${String(next).padStart(5, '0')}`;
  }

  private async assertLocationExists(locationId: string): Promise<void> {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true },
    });

    if (!location) {
      throw new BadRequestException(`Destination ${locationId} does not exist`);
    }
  }

  /**
   * Normalises the car block: when hasCar is false every car column is cleared,
   * otherwise all four are required and availableSeats must fit in totalSeats.
   */
  private resolveCarFields(
    hasCar: boolean,
    source: {
      carModel?: string;
      totalSeats?: number;
      availableSeats?: number;
      canTakeOthers?: boolean;
    },
  ): CarFields {
    if (!hasCar) {
      return {
        carModel: null,
        totalSeats: null,
        availableSeats: null,
        canTakeOthers: null,
      };
    }

    const { carModel, totalSeats, availableSeats, canTakeOthers } = source;

    if (!carModel || carModel.trim().length === 0) {
      throw new BadRequestException('carModel is required when hasCar is true');
    }
    if (typeof totalSeats !== 'number') {
      throw new BadRequestException(
        'totalSeats is required when hasCar is true',
      );
    }
    if (typeof availableSeats !== 'number') {
      throw new BadRequestException(
        'availableSeats is required when hasCar is true',
      );
    }
    if (availableSeats > totalSeats) {
      throw new BadRequestException(
        'availableSeats must be less than or equal to totalSeats',
      );
    }

    return {
      carModel: carModel.trim(),
      totalSeats,
      availableSeats,
      canTakeOthers: canTakeOthers ?? false,
    };
  }

  private toCompanionCreate(companion: CompanionDto) {
    return {
      fullName: companion.fullName,
      phone: companion.phone ?? null,
      relationship: companion.relationship ?? null,
    };
  }

  private isRegistrationNumberConflict(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return false;
    }
    if (error.code !== 'P2002') {
      return false;
    }

    const target = error.meta?.target;
    if (Array.isArray(target)) {
      return target.includes('registrationNumber');
    }
    return typeof target === 'string'
      ? target.includes('registrationNumber')
      : true;
  }
}
