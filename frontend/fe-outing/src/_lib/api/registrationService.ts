import {
  ApiError,
  CreateLocationInput,
  CreatePaymentCoreDto,
  CreatePaymentHistoryDto,
  PaymentCore,
  PaymentHistory,
  UpdateLocationInput,
  UpdatePaymentCoreDto,
  UpdatePaymentHistoryDto,
} from "./registration-type";

import {
  Location,
  Registration,
  CreateRegistrationInput,
  UpdateRegistrationInput,
  LoginInput,
  LoginResponse,
} from "./registration-type";

import { request } from "./request";

/* =========================================================
   HELPERS
========================================================= */

function compact<T extends object>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) =>
        value !== undefined &&
        value !== "",
    ),
  ) as T;
}

function buildRegistrationBody<
  T extends UpdateRegistrationInput
>(input: T): T {
  const body = compact(input);

  if (body.companions) {
    body.companions =
      body.companions.map((companion) =>
        compact(companion),
      );
  }

  return body;
}

function buildPaymentCoreBody<
  T extends
    | CreatePaymentCoreDto
    | UpdatePaymentCoreDto
>(input: T): T {
  return compact(input);
}

function buildPaymentHistoryBody<
  T extends
    | CreatePaymentHistoryDto
    | UpdatePaymentHistoryDto
>(input: T): T {
  return compact(input);
}

function buildLocationBody<
  T extends UpdateLocationInput
>(input: T): T {
  return compact(input);
}

function buildLoginBody<
  T extends LoginInput
>(input: T): T {
  return compact(input);
}

/* =========================================================
   LOCATION
========================================================= */

export function getLocations(
  signal?: AbortSignal,
) {
  return request<Location[]>(
    "/locations",
    { signal },
  );
}

export function getLocation(
  id: string,
  signal?: AbortSignal,
) {
  return request<Location>(
    `/locations/${id}`,
    { signal },
  );
}

export function createLocation(
  input: CreateLocationInput,
  signal?: AbortSignal,
) {
  return request<Location>(
    "/locations",
    {
      method: "POST",
      body: buildLocationBody(input),
      signal,
    },
  );
}

export function updateLocation(
  id: string,
  input: UpdateLocationInput,
  signal?: AbortSignal,
) {
  return request<Location>(
    `/locations/${id}`,
    {
      method: "PATCH",
      body: buildLocationBody(input),
      signal,
    },
  );
}

export function deleteLocation(
  id: string,
  signal?: AbortSignal,
) {
  return request<Location>(
    `/locations/${id}`,
    {
      method: "DELETE",
      signal,
    },
  );
}

/* =========================================================
   REGISTRATION
========================================================= */

export function createRegistration(
  input: CreateRegistrationInput,
  signal?: AbortSignal,
) {
  return request<Registration>(
    "/registrations",
    {
      method: "POST",
      body: buildRegistrationBody(input),
      signal,
    },
  );
}

export function getAllRegistrations(
  signal?: AbortSignal,
) {
  return request<Registration[]>(
    "/registrations",
    { signal },
  );
}

export function getRegistration(
  id: string,
  signal?: AbortSignal,
) {
  return request<Registration>(
    `/registrations/${id}`,
    { signal },
  );
}

export function updateRegistration(
  id: string,
  input: UpdateRegistrationInput,
  signal?: AbortSignal,
) {
  return request<Registration>(
    `/registrations/${id}`,
    {
      method: "PATCH",
      body: buildRegistrationBody(input),
      signal,
    },
  );
}

export function cancelRegistration(
  id: string,
  signal?: AbortSignal,
) {
  return request<Registration>(
    `/registrations/${id}`,
    {
      method: "DELETE",
      signal,
    },
  );
}

export async function findByRegistrationNumber(
  name: string,
  phone: string,
  signal?: AbortSignal,
): Promise<Registration | null> {
  const params = new URLSearchParams({
    name: name.trim(),
    phone: phone.trim(),
  });

  const registration =
    await request<Registration | null>(
      `/registrations/find-by-registration-number?${params.toString()}`,
      { signal },
    );

  if (!registration?.id) {
    return null;
  }

  return registration;
}

export function updateRegistrationByRegistrationNumber(
  name: string,
  phone: string,
  input: UpdateRegistrationInput,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    name: name.trim(),
    phone: phone.trim(),
  });

  return request<Registration>(
    `/registrations/update-by-registration-number?${params.toString()}`,
    {
      method: "PATCH",
      body: buildRegistrationBody(input),
      signal,
    },
  );
}

export function cancelRegistrationByRegistrationNumber(
  name: string,
  phone: string,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    name: name.trim(),
    phone: phone.trim(),
  });

  return request<Registration>(
    `/registrations/cancel-by-registration-number?${params.toString()}`,
    {
      method: "PATCH",
      body: buildRegistrationBody({
        status: "CANCELLED",
      }),
      signal,
    },
  );
}

/* =========================================================
   AUTH
========================================================= */

export function login(
  input: LoginInput,
  signal?: AbortSignal,
) {
  return request<LoginResponse>(
    "/login",
    {
      method: "POST",
      body: buildLoginBody(input),
      signal,
    },
  );
}

/* =========================================================
   PAYMENT CORE
========================================================= */

export function getPaymentCores(
  signal?: AbortSignal,
) {
  return request<PaymentCore[]>(
    "/payment-cores",
    { signal },
  );
}

export function createPaymentCore(
  input: CreatePaymentCoreDto,
  signal?: AbortSignal,
) {
  return request<PaymentCore>(
    "/payment-cores",
    {
      method: "POST",
      body: buildPaymentCoreBody(input),
      signal,
    },
  );
}

export function updatePaymentCore(
  id: string,
  input: UpdatePaymentCoreDto,
  signal?: AbortSignal,
) {
  return request<PaymentCore>(
    `/payment-cores/${id}`,
    {
      method: "PATCH",
      body: buildPaymentCoreBody(input),
      signal,
    },
  );
}

/* =========================================================
   PAYMENT HISTORY
========================================================= */

export function getPaymentHistories(
  signal?: AbortSignal,
) {
  return request<PaymentHistory[]>(
    "/payment-histories",
    { signal },
  );
}

export function getPaymentHistory(
  id: string,
  signal?: AbortSignal,
) {
  return request<PaymentHistory>(
    `/payment-histories/${id}`,
    { signal },
  );
}

export function createPaymentHistory(
  input: CreatePaymentHistoryDto,
  signal?: AbortSignal,
) {
  return request<PaymentHistory>(
    "/payment-histories",
    {
      method: "POST",
      body: buildPaymentHistoryBody(input),
      signal,
    },
  );
}

export function updatePaymentHistory(
  id: string,
  input: UpdatePaymentHistoryDto,
  signal?: AbortSignal,
) {
  return request<PaymentHistory>(
    `/payment-histories/${id}`,
    {
      method: "PATCH",
      body: buildPaymentHistoryBody(input),
      signal,
    },
  );
}

/* =========================================================
   PAYMENT REGISTRATION
========================================================= */

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

export function getRegistrationPayment(
  registrationId: string,
  signal?: AbortSignal,
) {
  return request<RegistrationPaymentResponse>(
    `/payment/registration/${registrationId}`,
    { signal },
  );
}

/* =========================================================
   UPLOAD PAYMENT SLIP
========================================================= */

export function uploadPaymentSlip(
  formId: string,
  file: File,
  signal?: AbortSignal,
) {
  const formData = new FormData();

  formData.append(
    "formId",
    formId,
  );

  formData.append(
    "slip",
    file,
  );

  return request<PaymentHistory>(
    "/payment/history",
    {
      method: "POST",
      body: formData,
      signal,
    },
  );
}
