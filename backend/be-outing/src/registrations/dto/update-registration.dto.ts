import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { RegistrationStatus } from '../../generated/prisma/enums';
import {
  normalizePhone,
  PHONE_MESSAGE,
  PHONE_REGEX,
  trim,
  trimToUndefined,
} from '../../common/validators';
import { CompanionDto } from './companion.dto';

/**
 * Every field is optional because PATCH is partial. Cross-field rules
 * (companions required when hasCompanions, car fields required when hasCar,
 * availableSeats <= totalSeats) cannot be expressed here because the request
 * may omit the flag it depends on; they are enforced in RegistrationsService
 * against the merged state of the stored row plus this patch.
 */
export class UpdateRegistrationDto {
  @Transform(({ value }) => trim(value))
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  fullName?: string;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @Transform(({ value }) => normalizePhone(trim(value)))
  @IsOptional()
  @Matches(PHONE_REGEX, { message: `phone ${PHONE_MESSAGE}` })
  phone?: string;

  @Transform(({ value }) => trim(value))
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 60)
  lineId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'locationId must be a valid destination id' })
  locationId?: string;

  @IsOptional()
  @IsBoolean()
  hasCompanions?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CompanionDto)
  companions?: CompanionDto[];

  @IsOptional()
  @IsBoolean()
  hasCar?: boolean;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  carModel?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  totalSeats?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  availableSeats?: number;

  @IsOptional()
  @IsBoolean()
  canTakeOthers?: boolean;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(500)
  foodAllergy?: string;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsEnum(RegistrationStatus, {
    message: 'status must be one of PENDING, CONFIRMED, CANCELLED',
  })
  status?: RegistrationStatus;
}
