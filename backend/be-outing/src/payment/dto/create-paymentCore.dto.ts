import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsString,
    IsUrl,
    IsUUID,
    Min,
} from "class-validator";

export class CreatePaymentCoreDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsInt()
    @Min(0)
    amountPerPerson!: number;

    @IsUrl()
    @IsNotEmpty()
    qrCodeUrl!: string;
}
