import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
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

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  beds!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  residentCapacity!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  carparkCapacity!: number;

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
}
