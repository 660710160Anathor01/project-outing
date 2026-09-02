import { ApiError } from "./registration-type";

const BASE_URL =
  process.env.NEXT_PUBLIC_REGISTRATION_SERVICE_URL;

function toMessages(
  body: unknown,
  status: number,
): string[] {
  if (
    body &&
    typeof body === "object" &&
    "message" in body
  ) {
    const { message } = body as {
      message: unknown;
    };

    if (Array.isArray(message)) {
      return message.map(String);
    }

    if (typeof message === "string") {
      return [message];
    }
  }

  return [
    `Request failed with status ${status}`,
  ];
}

export type RequestOptions = {
  method?:
    | "GET"
    | "POST"
    | "PATCH"
    | "DELETE";

  body?: unknown;
  signal?: AbortSignal;
};

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
  } = options;

  const isFormData =
    body instanceof FormData;

  let response: Response;

  try {
    response = await fetch(
      `${BASE_URL}${path}`,
      {
        method,
        signal,

        headers: isFormData
          ? undefined
          : body
            ? {
                "Content-Type":
                  "application/json",
              }
            : undefined,

        body:
          body === undefined
            ? undefined
            : isFormData
              ? body
              : JSON.stringify(body),
      },
    );
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw error;
    }

    throw new ApiError(0, [
      "Could not reach the server. Please try again.",
    ]);
  }

  const payload =
    response.status === 204
      ? null
      : await response
          .json()
          .catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      toMessages(
        payload,
        response.status,
      ),
    );
  }

  return payload as T;
}
