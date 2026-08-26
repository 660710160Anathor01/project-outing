import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
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
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  IsNotGreaterThan,
  normalizePhone,
  PHONE_MESSAGE,
  PHONE_REGEX,
  trim,
  trimToUndefined,
} from '../../common/validators';
import { CompanionDto } from './companion.dto';

export class CreateRegistrationDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty({ message: 'fullName is required' })
  @Length(2, 120)
  fullName: string;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @Transform(({ value }) => normalizePhone(trim(value)))
  @IsString()
  @IsNotEmpty({ message: 'phone is required' })
  @Matches(PHONE_REGEX, { message: `phone ${PHONE_MESSAGE}` })
  phone: string;

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty({ message: 'lineId is required' })
  @Length(1, 60)
  lineId: string;

  @IsUUID('4', { message: 'locationId must be a valid destination id' })
  locationId: string;

  @IsBoolean()
  hasCompanions: boolean;

  /** Required, and must hold at least one entry, when hasCompanions is true. */
  @ValidateIf((dto: CreateRegistrationDto) => dto.hasCompanions === true)
  @IsArray()
  @ArrayMinSize(1, {
    message: 'at least one companion is required when hasCompanions is true',
  })
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CompanionDto)
  companions?: CompanionDto[];

  @IsBoolean()
  hasCar: boolean;

  @ValidateIf((dto: CreateRegistrationDto) => dto.hasCar === true)
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty({ message: 'carModel is required when hasCar is true' })
  @MaxLength(120)
  carModel?: string;

  @ValidateIf((dto: CreateRegistrationDto) => dto.hasCar === true)
  @IsInt({ message: 'totalSeats is required when hasCar is true' })
  @Min(1)
  @Max(60)
  totalSeats?: number;

  @ValidateIf((dto: CreateRegistrationDto) => dto.hasCar === true)
  @IsInt({ message: 'availableSeats is required when hasCar is true' })
  @Min(0)
  @Max(60)
  @IsNotGreaterThan('totalSeats', {
    message: 'availableSeats must be less than or equal to totalSeats',
  })
  availableSeats?: number;

  @ValidateIf((dto: CreateRegistrationDto) => dto.hasCar === true)
  @IsBoolean({ message: 'canTakeOthers is required when hasCar is true' })
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
}
