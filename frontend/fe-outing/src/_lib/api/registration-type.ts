export type RegistrationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

/** Dates arrive as ISO strings over JSON, not Date objects. */
// export type Location = {
//   id: string;
//   name: string;
//   description: string | null;
//   imageUrl: string | null;
//   startDate: string | null;
//   endDate: string | null;
//   createdAt: string;
//   updatedAt: string;
// };

export type Companion = {
  name: string;
  phone?: string;
  relationship?: string;
};

export type Location = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  beds: number;
  residentCapacity: number;
  carparkCapacity: number;
  mapUrl: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
}

export type Registration = {
  id: string;
  name: string;
  phone: string;
  lineId: string;

  locationId: string;
  companions?: CompanionInput[];
  travelOption: "SELF_DRIVE" | "CAR_SHARE";
  carShare?: boolean;
  emptySeats?: number;
  address?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type CompanionInput = {
  name: string;
  phone?: string;
  relationship?: string;
};

export type CreateRegistrationInput = {
  name: string;
  phone: string;
  lineId: string;
  locationId: string;
  companions?: CompanionInput[];
  travelOption: "SELF_DRIVE" | "CAR_SHARE";
  carShare?: boolean;
  emptySeats?: number;
  note?: string;
};

export type UpdateRegistrationInput = Partial<CreateRegistrationInput> & {
  status?: RegistrationStatus;
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
