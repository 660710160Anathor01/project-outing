import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from "class-validator";
import {
  normalizePhone,
  PHONE_MESSAGE,
  PHONE_REGEX,
  trim,
  trimToUndefined,
} from "../../common/validators";

export class CompanionDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty({ message: "companion name is required" })
  @Length(2, 120)
  name!: string;

  @Transform(({ value }) => normalizePhone(trimToUndefined(value)))
  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, {
    message: `companion phone ${PHONE_MESSAGE}`,
  })
  phone?: string;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(60)
  relationship?: string;
}
