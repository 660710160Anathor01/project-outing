import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Min,
    ValidateIf,
  } from "class-validator";
  
  export class UpdatePaymentCoreDto {
    @IsString()
    @IsNotEmpty()
    name!: string;
  
    @IsNumber()
    @Min(0)
    amountPerPerson!: number;
  
    @IsOptional()
    @ValidateIf((_, value) => value !== null && value !== "")
    @IsUrl()
    qrCodeUrl!: string | null;
  }
  