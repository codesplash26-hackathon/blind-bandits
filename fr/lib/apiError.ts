import { isAxiosError } from "axios";

/**
 * The message to show a user when a request fails.
 *
 * The backend's `ErrorResponse.message` is always the most useful thing we have
 * — it names the sack, the quota or the wallet that was wrong — so it wins over
 * the generic axios text.
 */
export const describeApiError = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && typeof detail[0]?.msg === "string") {
      return detail[0].msg.replace(/^Value error, /, "");
    }
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export default describeApiError;
