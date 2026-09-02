import {
    PaymentHistory,
    CreatePaymentHistoryDto,
    RegistrationPaymentResponse,
    PaymentCore,
    UpdatePaymentCoreDto,
    PaymentHistoryStatus,
  } from "./payment-type";
  import { RegistrationStatus } from "./registration-type";
  
  import { request } from "./request";
  
  /* =====================================================
     PAYMENT SLIP
  ===================================================== */
  
  /**
   * Upload Payment Slip
   *
   * POST /payment/history/:id/slip
   *
   * Sends multipart/form-data.
   */
  export function uploadPaymentSlip(
    paymentId: string,
    file: File,
    signal?: AbortSignal,
  ) {
    const formData = new FormData();
  
    formData.append("file", file);
  
    return request<PaymentHistory>(
      `/payment/history/${paymentId}/slip`,
      {
        method: "POST",
        body: formData,
        signal,
      },
    );
  }
  
  /* =====================================================
     PAYMENT CORE
  ===================================================== */
  
  /**
   * Get all payment cores
   *
   * GET /payment/core
   */
  export function getPaymentCores(
    signal?: AbortSignal,
  ) {
    return request<PaymentCore[]>(
      "/payment/core",
      {
        signal,
      },
    );
  }
  
  /**
   * Get active payment core
   *
   * GET /payment/core/active
   */
  export function getActivePaymentCore(
    signal?: AbortSignal,
  ) {
    return request<PaymentCore | null>(
      "/payment/core/active",
      {
        signal,
      },
    );
  }
  
  /**
   * Get payment core by ID
   *
   * GET /payment/core/:id
   */
  export function getPaymentCore(
    paymentCoreId: string,
    signal?: AbortSignal,
  ) {
    return request<PaymentCore>(
      `/payment/core/${paymentCoreId}`,
      {
        signal,
      },
    );
  }
  
  /**
   * Update payment core
   *
   * PATCH /payment/core/:id
   */
  export function updatePaymentCore(
    paymentCoreId: string,
    input: UpdatePaymentCoreDto,
    signal?: AbortSignal,
  ) {
    return request<PaymentCore>(
      `/payment/core/${paymentCoreId}`,
      {
        method: "PATCH",
        body: input,
        signal,
      },
    );
  }
  
  /* =====================================================
     PAYMENT HISTORY
  ===================================================== */
  
  /**
   * Get all payment histories
   *
   * GET /payment/history
   */
  export function getPaymentHistories(
    signal?: AbortSignal,
  ) {
    return request<PaymentHistory[]>(
      "/payment/history",
      {
        signal,
      },
    );
  }
  
  /**
   * Get payment history by ID
   *
   * GET /payment/history/:id
   */
  export function getPaymentHistory(
    paymentId: string,
    signal?: AbortSignal,
  ) {
    return request<PaymentHistory>(
      `/payment/history/${paymentId}`,
      {
        signal,
      },
    );
  }
  
  /**
   * Update payment history
   *
   * PATCH /payment/history
   */
  export type UpdatePaymentHistoryDto = {
    paymentId: string;
    status?: PaymentHistoryStatus;
  };
  
  export function updatePaymentHistory(
    input: UpdatePaymentHistoryDto,
    signal?: AbortSignal,
  ) {
    return request<PaymentHistory>(
      "/payment/history",
      {
        method: "PATCH",
        body: input,
        signal,
      },
    );
  }
  
  /* =====================================================
     REGISTRATION PAYMENT
  ===================================================== */
  
  /**
   * Get payment information of a registration
   *
   * GET /payment/registration/:formId
   *
   * Response:
   *
   * registration
   *   - id
   *   - registrationNumber
   *   - status
   *   - name
   *   - phone
   *
   * payment
   *   - id
   *   - amount
   *   - peopleCount
   *   - slipUrl
   *   - paidAt
   *   - verifiedAt
   *
   * paymentCore
   *   - id
   *   - name
   *   - amountPerPerson
   *   - qrCodeUrl
   */
  export function getRegistrationPayment(
    formId: string,
    signal?: AbortSignal,
  ) {
    return request<{
      registration: {
        id: string;
        registrationNumber: string | null;
        status: RegistrationStatus;
        name: string;
        phone: string;
      };
  
      payment: {
        id: string | null;
        amount: number;
        peopleCount: number;
        slipUrl: string | null;
        paidAt: string | null;
        verifiedAt: string | null;
      };
  
      paymentCore: PaymentCore;
    }>(
      `/payment/registration/${formId}`,
      {
        signal,
      },
    );
  }
  
  /* =====================================================
     CREATE PAYMENT HISTORY
  ===================================================== */
  
  /**
   * Create Payment History
   *
   * POST /payment/history
   */
  export type CreatePaymentDto = {
    formId: string;
    slipUrl?: string | null;
  };
  
  export function createPaymentHistory(
    input: CreatePaymentDto,
    signal?: AbortSignal,
  ) {
    return request<PaymentHistory>(
      "/payment/history",
      {
        method: "POST",
        body: input,
        signal,
      },
    );
  }
  