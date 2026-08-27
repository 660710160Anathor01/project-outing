import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
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

export class CreateRegistrationDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty({ message: "name is required" })
  @Length(2, 120)
  name!: string;

  @Transform(({ value }) => normalizePhone(trim(value)))
  @IsString()
  @IsNotEmpty({ message: "phone is required" })
  @Matches(PHONE_REGEX, {
    message: `phone ${PHONE_MESSAGE}`,
  })
  phone!: string;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(60)
  lineId?: string;

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty({ message: "locationId is required" })
  @MaxLength(120)
  locationId!: string;

  @IsString()
  @IsIn(["SELF_DRIVE", "CAR_SHARE", "PUBLIC_TRANSPORT"], {
    message:
      "travelOption must be one of SELF_DRIVE, CAR_SHARE, PUBLIC_TRANSPORT",
  })
  travelOption!: "SELF_DRIVE" | "CAR_SHARE" | "PUBLIC_TRANSPORT";

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CompanionDto)
  companions!: CompanionDto[];

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
