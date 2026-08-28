import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import {
  normalizePhone,
  PHONE_MESSAGE,
  PHONE_REGEX,
  trim,
  trimToUndefined,
} from "../../common/validators";
import { CompanionDto } from "./companion.dto";

export class UpdateRegistrationDto {
  @Transform(({ value }) => trim(value))
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "name is required" })
  @Length(2, 120)
  name?: string;

  @Transform(({ value }) => normalizePhone(trim(value)))
  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, {
    message: `phone ${PHONE_MESSAGE}`,
  })
  phone?: string;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(60)
  lineId?: string;

  @Transform(({ value }) => trim(value))
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsIn(["SELF_DRIVE", "CAR_SHARE", "PUBLIC_TRANSPORT"], {
    message:
      "travelOption must be one of SELF_DRIVE, CAR_SHARE, PUBLIC_TRANSPORT",
  })
  travelOption?: "SELF_DRIVE" | "CAR_SHARE" | "PUBLIC_TRANSPORT";

  @IsOptional()
  @IsBoolean()
  carShare?: boolean;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  @Min(0)
  emptySeats?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CompanionDto)
  companions?: CompanionDto[];

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
