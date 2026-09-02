// import {
//     Injectable,
//     InternalServerErrorException,
//   } from "@nestjs/common";
  
//   import {
//     S3Client,
//     PutObjectCommand,
//   } from "@aws-sdk/client-s3";
  
//   @Injectable()
//   export class StorageService {
//     private readonly s3: S3Client;
//     private readonly bucket: string;
  
//     constructor() {
//       const endpoint = process.env.AWS_ENDPOINT_URL_S3;
//       const region = process.env.AWS_REGION;
//       const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
//       const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
//       const bucket = process.env.AWS_S3_BUCKET;
  
//       if (!endpoint) {
//         throw new Error("AWS_ENDPOINT_URL_S3 is not configured");
//       }
  
//       if (!region) {
//         throw new Error("AWS_REGION is not configured");
//       }
  
//       if (!accessKeyId) {
//         throw new Error("AWS_ACCESS_KEY_ID is not configured");
//       }
  
//       if (!secretAccessKey) {
//         throw new Error("AWS_SECRET_ACCESS_KEY is not configured");
//       }
  
//       if (!bucket) {
//         throw new Error("AWS_S3_BUCKET is not configured");
//       }
  
//       this.bucket = bucket;
  
//       this.s3 = new S3Client({
//         region,
//         endpoint,
  
//         credentials: {
//           accessKeyId,
//           secretAccessKey,
//         },
  
//         // สำคัญสำหรับ Neon Object Storage
//         forcePathStyle: true,
//       });
//     }
  
//     async uploadPaymentSlip(
//       file: Express.Multer.File,
//       paymentId: string,
//     ) {
//       const extension =
//         file.originalname.split(".").pop()?.toLowerCase() ||
//         "png";
  
//       const key =
//         `payment-slips/${paymentId}/${Date.now()}.${extension}`;
  
//       try {
//         await this.s3.send(
//           new PutObjectCommand({
//             Bucket: this.bucket,
//             Key: key,
//             Body: file.buffer,
//             ContentType: file.mimetype,
//           }),
//         );
  
//         return {
//           key,
//         };
//       } catch (error) {
  
//         throw new InternalServerErrorException(
//           "Failed to upload payment slip",
//         );
//       }
//     }
//   }
  