export type RegistrationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "CANCELLED";

/** Dates arrive as ISO strings over JSON, not Date objects. */

export type LoginInput = {
  userName: string;
  pass: string;
};

export type LoginResponse = {
  token: string;
  role: string;
  expiresIn: number;
};

export type CompanionInput = {
  name: string;
  phone?: string;
  relationship?: string;
};

export type Companion = CompanionInput;

export type Location = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  beds: string;
  residentCapacity: string;
  carparkCapacity: string;
  price: string;
  mapUrl: string | null;
  sourceUrl: string | null;
  imageUrl: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Registration = {
  id: string;
  registrationNumber: string;

  name: string;
  phone: string;
  lineId: string | null;

  locationId: string;
  companions: CompanionInput[];

  travelOption: "SELF_DRIVE" | "CAR_SHARE";
  carShare: boolean;
  emptySeats: number;

  address: string | null;
  note: string | null;

  status: RegistrationStatus;

  createdAt: string;
  updatedAt: string;
};

export type CreateRegistrationInput = {
  name: string;
  phone: string;
  lineId?: string;
  locationId: string;
  companions?: CompanionInput[];
  travelOption?: "SELF_DRIVE" | "CAR_SHARE";
  address?: string;
  carShare?: boolean;
  emptySeats?: number;
  note?: string;
};

export type UpdateRegistrationInput =
  Partial<CreateRegistrationInput> & {
    status?: RegistrationStatus;
  };

export type CreateLocationInput = {
  name: string;
  description?: string;
  address: string;
  beds: string;
  residentCapacity: string;
  carparkCapacity: string;
  price: string;
  mapUrl?: string;
  sourceUrl?: string;
  imageUrl?: string[];
};

export type UpdateLocationInput = Partial<CreateLocationInput> & {
  status?: string;
};

export type PaymentCore = {
  id: string;
  name: string;
  amountPerPerson: number;
  qrCodeUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentCoreInput = {
  name: string;
  amountPerPerson: number;
  qrCodeUrl?: string | null;
  isActive?: boolean;
};

export type UpdatePaymentCoreInput = {
  name?: string;
  amountPerPerson?: number;
  qrCodeUrl?: string | null;
  isActive?: boolean;
};

export type PaymentHistoryStatus =
  | "PENDING"
  | "PAID"
  | "FAILED";

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
  verifiedBy: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentHistoryInput = {
  formId: string;
  paymentCoreId: string;
  amount: number;
  peopleCount: number;
  slipUrl?: string | null;
  status?: PaymentHistoryStatus;
};

export type UpdatePaymentHistoryInput =
  Partial<CreatePaymentHistoryInput> & {
    paidAt?: string | null;
    verifiedAt?: string | null;
    verifiedBy?: string | null;
  };

/**
 * Carries the whole Nest error body. `messages` is always an array because
 * ValidationPipe returns a list of field errors while other exceptions
 * return a single string.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.messages = messages;
  }

  get isValidationError() {
    return this.status === 400;
  }

  get isRateLimited() {
    return this.status === 429;
  }

  get isNotFound() {
    return this.status === 404;
  }
}
