import { ApiError } from "./registration-type";
import { 
    Location, 
    Registration, 
    CreateRegistrationInput, 
    UpdateRegistrationInput 
} from "./registration-type";

const BASE_URL = process.env.NEXT_PUBLIC_REGISTRATION_SERVICE_URL;

function toMessages(body: unknown, status: number): string[] {
    if (body && typeof body === "object" && "message" in body) {
      const { message } = body as { message: unknown };
      if (Array.isArray(message)) return message.map(String);
      if (typeof message === "string") return [message];
    }
    return [`Request failed with status ${status}`];
  }
  
  type RequestOptions = {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
  };
  
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, signal } = options;
  
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        signal,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new ApiError(0, ["Could not reach the server. Please try again."]);
    }
  
    const payload = response.status === 204 ? null : await response.json().catch(() => null);
  
    if (!response.ok) {
      throw new ApiError(response.status, toMessages(payload, response.status));
    }
    return payload as T;
  }
  
  /**
   * The API rejects unknown keys (forbidNonWhitelisted), and sending explicit
   * `undefined` would serialise the key away anyway — this makes that intent
   * explicit and drops empty optional strings the same way the DTOs do.
   */
  function compact<T extends object>(input: T): T {
    return Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined && value !== ""),
    ) as T;
  }
  
  function buildRegistrationBody<T extends UpdateRegistrationInput>(input: T): T {
    const body = compact(input);
  
    if (body.companions) {
      body.companions = body.companions.map((companion) => compact(companion));
    }
  
    return body;
  }
  
  export function getLocations(signal?: AbortSignal) {
    return request<Location[]>("/locations", { signal });
  }
  
  export function getLocation(id: string, signal?: AbortSignal) {
    return request<Location>(`/locations/${id}`, { signal });
  }
  
  export function createRegistration(input: CreateRegistrationInput, signal?: AbortSignal) {
    return request<Registration>("/registrations", {
      method: "POST",
      body: buildRegistrationBody(input),
      signal,
    });
  }

  export function getAllRegistrations(signal?: AbortSignal) {
    return request<Registration[]>("/registrations", { signal });
  }
  
  export function getRegistration(id: string, signal?: AbortSignal) {
    return request<Registration>(`/registrations/${id}`, { signal });
  }
  
  export function updateRegistration(
    id: string,
    input: UpdateRegistrationInput,
    signal?: AbortSignal,
  ) {
    return request<Registration>(`/registrations/${id}`, {
      method: "PATCH",
      body: buildRegistrationBody(input),
      signal,
    });
  }
  
  /** Soft delete — the row survives with status CANCELLED and is returned. */
  export function cancelRegistration(id: string, signal?: AbortSignal) {
    return request<Registration>(`/registrations/${id}`, { method: "DELETE", signal });
  }