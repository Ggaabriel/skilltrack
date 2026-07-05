import { z } from "zod";
import { authTokenStore } from "./auth-token";
import { ApiError, codeFromStatus } from "./error";

export interface RefresherOptions {
  baseURL: string;
  path?: string;
}

const RefreshResponseSchema = z.object({
  accessToken: z.string().min(1),
});

export function createRefresher(
  options: RefresherOptions,
): () => Promise<string> {
  const refreshPath = options.path ?? "/api/auth/refresh";
  const refreshURL = `${options.baseURL}${refreshPath}`;

  let inflightRequest: Promise<string> | null = null;

  async function performRefresh(): Promise<string> {
    const response = await fetch(refreshURL, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      authTokenStore.clear();
      throw new ApiError({
        status: response.status,
        code: codeFromStatus(response.status),
        message: "Session expired. Please sign in again.",
        payload: { endpoint: "auth/refresh" },
      });
    }

    const parsed = RefreshResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new ApiError({
        status: 502,
        code: "SERVER",
        message: "Unable to refresh authentication. Please try again later.",
        payload: {
          endpoint: "auth/refresh",
          issues: parsed.error.issues,
        },
        cause: parsed.error,
      });
    }

    authTokenStore.set(parsed.data.accessToken);
    return parsed.data.accessToken;
  }

  return function refresh() {
    if (inflightRequest) {
      return inflightRequest;
    }

    inflightRequest = performRefresh().finally(() => {
      inflightRequest = null;
    });

    return inflightRequest;
  };
}
