import { env } from "../config/env";
import { reportApiError, toApiError } from "./error";
import { authTokenStore } from "./auth/authToken";
import { buildRequest } from "./request";
import { sendRequest } from "./transport";
import { parseResponse } from "./response";

/**
 * Standard API response format
 */
export type ApiResponse<T> = {
  data: T;
  message: string;
  ok: boolean;
  status: number;
  meta?: {
    page?: number;
    total?: number;
    lastPage?: number;
  };
};
export interface HttpClientOptions {
  baseURL?: string;
  refreshPath?: string;
  refresh?: () => Promise<string>;
  onUnauthorized?: () => void;
}

type JsonBody = Record<string, unknown> | unknown[];

export interface HttpInit extends Omit<RequestInit, "body"> {
  body?: JsonBody | BodyInit | null;
}

export interface HttpClient {
  request<T = unknown>(path: string, init?: HttpInit): Promise<T | undefined>;
  get<T = unknown>(path: string, init?: HttpInit): Promise<T | undefined>;
  post<T = unknown>(
    path: string,
    body?: BodyInit,
    init?: HttpInit,
  ): Promise<T | undefined>;
  patch<T = unknown>(
    path: string,
    body?: BodyInit,
    init?: HttpInit,
  ): Promise<T | undefined>;
  delete<T = unknown>(path: string, init?: HttpInit): Promise<T | undefined>;
}
const DEFAULT_BASE_URL = env.VITE_API_BASE_URL;

// async function failWith(
//   response: Response,
//   url: string,
//   extra?: Record<string, unknown>,
// ): Promise<never> {
//   const err = await toApiError(response);
//   reportApiError(err, { url, ...extra });
//   throw err;
// }

export function createHttpClient(options: HttpClientOptions = {}): HttpClient {
  const baseURL = options.baseURL ?? DEFAULT_BASE_URL;

  async function request<T>(
    path: string,
    init: HttpInit = {},
    // isRetry = false,
  ): Promise<T | undefined> {
    const token = authTokenStore.get();

    const requestInit = buildRequest(init, token);

    const url = baseURL + path;

    const response = await sendRequest(url, requestInit);

    // if (response.status === 401 && !isRetry) {
    //   await refreshToken();

    //   return request<T>(path, init, true);
    // }

    // И не вызывай reportApiError до этого места.

    // То есть порядок должен быть:

    // const response = await sendRequest(...);

    // if (401) {
    //     refresh();
    // }

    // if (!response.ok) {
    //     toApiError();
    //     reportApiError();
    //     throw error;
    // }

    if (!response.ok) {
      const error = await toApiError(response);

      reportApiError(error, {
        url,
      });

      throw error;
    }

    return parseResponse<T>(response);
  }

  return {
    request: (path, init) => request(path, init),
    get: (path, init) => request(path, { ...init, method: "GET" }),
    post: (path, body, init) =>
      request(path, { ...init, method: "POST", body }),
    patch: (path, body, init) =>
      request(path, { ...init, method: "PATCH", body }),
    delete: (path, init) => request(path, { ...init, method: "DELETE" }),
  };
}
