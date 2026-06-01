import { isAxiosError } from "axios";

// Shape of the JSON body our API returns on errors.
// NestJS-style: `message` can be a single string or an array of strings.
interface ApiErrorBody {
  message?: string | string[];
  error?: string;
}

/**
 * Turns any thrown value (axios error, native Error, unknown) into a
 * human-friendly message we can show in a toast / inline.
 *
 * Without this, axios surfaces things like "Request failed with status code 409"
 * instead of the server's real "Email already registered" message.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isAxiosError<ApiErrorBody>(err)) {
    const data = err.response?.data;

    if (data) {
      if (Array.isArray(data.message) && data.message[0]) {
        return data.message[0];
      }
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }
      if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
      }
    }

    // No useful body — fall back to transport-level reasons.
    if (err.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    if (!err.response) {
      return "Network error — please check your connection.";
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
