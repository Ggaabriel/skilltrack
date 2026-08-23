import { authTokenStore } from "./authToken";
import { ApiError, codeFromStatus } from "../error";
import { sendRequest } from "../transport";
import type { ApiResponse } from "../client";

export interface RefresherOptions {
  baseURL: string;
  path?: string;
}

export function createRefresher(
  options: RefresherOptions,
): () => Promise<string> {
  const refreshPath = options.path ?? "/api/auth/refresh";
  const refreshURL = `${options.baseURL}${refreshPath}`;

  let inflightRequest: Promise<string> | null = null;

  async function performRefresh(): Promise<string> {
    const response = await sendRequest(refreshURL, {
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

    const parsed: ApiResponse<{ accessToken: string }> = await response.json();

    if (
      !parsed.data.accessToken &&
      typeof parsed.data.accessToken !== "string"
    ) {
      throw new ApiError({
        status: response.status,
        code: codeFromStatus(response.status),
        message: "Invalid accessToken: " + parsed.data.accessToken,
        payload: { endpoint: "auth/refresh" },
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
