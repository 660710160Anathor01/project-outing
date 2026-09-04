import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
} from "class-validator";
import {
  trim,
  trimToUndefined,
} from "../../common/validators";

export class CreateLocationDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty({ message: "name is required" })
  @MaxLength(120)
  name!: string;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty({ message: "address is required" })
  @MaxLength(500)
  address!: string;

  @Transform(({ value }) => String(value))
  @IsString()
  @Matches(/^\d+$/, {
    message: "beds must be a non-negative integer",
  })
  beds!: string;

  @Transform(({ value }) => String(value))
  @IsString()
  @Matches(/^\d+$/, {
    message: "residentCapacity must be a non-negative integer",
  })
  residentCapacity!: string;

  @Transform(({ value }) => String(value))
  @IsString()
  @Matches(/^\d+$/, {
    message: "carparkCapacity must be a non-negative integer",
  })
  carparkCapacity!: string;

  @Transform(({ value }) => String(value))
  @IsString()
  @IsNotEmpty({ message: "price is required" })
  @Matches(/^\d+(\.\d+)?$/, {
    message: "price must be a valid number",
  })
  price!: string;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsUrl({}, { message: "mapUrl must be a valid URL" })
  @MaxLength(2000)
  mapUrl?: string;

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsUrl({}, { message: "sourceUrl must be a valid URL" })
  @MaxLength(2000)
  sourceUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  imageUrl?: string[];

  @Transform(({ value }) => trimToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  status?: string;
}
