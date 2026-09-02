export type RegistrationPaymentResponse = {
    registration: {
      id: string;
      registrationNumber: string;
      name: string;
      phone: string;
    };
  
    payment: {
      id: string | null;
      amount: number;
      peopleCount: number;
      status: string;
      slipUrl: string | null;
      paidAt: string | null;
      verifiedAt: string | null;
    };
  
    paymentCore: {
      id: string;
      name: string;
      amountPerPerson: number;
      qrCodeUrl: string | null;
    };
  };
  
  
  /**
   * Create Payment History
   *
   * Backend calculates:
   * - paymentCoreId
   * - amount
   * - peopleCount
   * - status
   */
  export type CreatePaymentHistoryDto = {
    formId: string;
  };
  

  export type CreatePaymentCoreDto = {
    name: string;
    amountPerPerson: number;
    qrCodeUrl: string | null;
  };

  
  export type PaymentCore = {
    id: string;
    name: string;
    amountPerPerson: number;
    qrCodeUrl: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  
  export type UpdatePaymentCoreDto = {
    name: string;
    amountPerPerson: number;
    qrCodeUrl: string | null;
  };
  
  export type PaymentHistoryStatus =
    | "PENDING"
    | "PAID"
    | "CANCELLED";
  
  export type PaymentHistoryForm = {
    id: string;
    registrationNumber: string | null;
    name: string;
    phone: string;
    lineId?: string | null;
    companions?: unknown;
    status?: string;
  };
  
  export type PaymentHistory = {
    id: string;
    formId: string;
    paymentCoreId: string;
    amount: number;
    peopleCount: number;
    slipUrl: string | null;
    status: PaymentHistoryStatus;
    paidAt: string | null;
    verifiedAt: string | null;
    createdAt: string;
    updatedAt?: string;
  
    form: PaymentHistoryForm;
  
    paymentCore: PaymentCore;
  };