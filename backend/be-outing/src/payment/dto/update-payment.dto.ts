// import {
//   IsIn,
//   IsNotEmpty,
//   IsOptional,
//   IsUUID,
// } from "class-validator";

// export class UpdatePaymentDto {
//   @IsUUID()
//   @IsNotEmpty()
//   paymentId!: string;

//   @IsOptional()
//   @IsIn(["PENDING", "PAID", "CANCELLED"], {
//     message:
//       "status must be one of PENDING, PAID, CANCELLED",
//   })
//   status?: "PENDING" | "PAID" | "CANCELLED";
// }
