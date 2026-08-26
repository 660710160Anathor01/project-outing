export type RegistrationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

/** Dates arrive as ISO strings over JSON, not Date objects. */
export type Location = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Companion = {
  id: string;
  registrationId: string;
  fullName: string;
  phone: string | null;
  relationship: string | null;
  createdAt: string;
};

export type Registration = {
  id: string;
  registrationNumber: string;
  fullName: string;
  department: string | null;
  phone: string;
  lineId: string;
  locationId: string;
  hasCompanions: boolean;
  hasCar: boolean;
  carModel: string | null;
  totalSeats: number | null;
  availableSeats: number | null;
  canTakeOthers: boolean | null;
  foodAllergy: string | null;
  note: string | null;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  location: Location;
  companions: Companion[];
};

export type CompanionInput = {
  fullName: string;
  phone?: string;
  relationship?: string;
};

export type CreateRegistrationInput = {
  fullName: string;
  department?: string;
  phone: string;
  lineId: string;
  locationId: string;
  hasCompanions: boolean;
  companions?: CompanionInput[];
  hasCar: boolean;
  carModel?: string;
  totalSeats?: number;
  availableSeats?: number;
  canTakeOthers?: boolean;
  foodAllergy?: string;
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
