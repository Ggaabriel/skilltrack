import { env } from "../config/env";
import { ApiError, reportApiError, toApiError } from "./error";
import { authTokenStore } from "./auth-token";
import { createRefresher } from "./refresh";
import type { ApiRequest } from "./interceptors";
import { attachAlbumHeader, attachAuthHeader } from "./interceptors";

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

/**
 * Query parameters for GET requests
 */
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * HTTP client for making API requests
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(path: string, params?: QueryParams): string {
    const url = new URL(this.baseUrl + path);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Generic request method
   */
  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const res = await fetch(path, init);

    if (!res.ok) {
      throw await toApiError(res);
    }

    return res.json();
  }

  /**
   * GET request
   */
  async get<T>(path: string, params?: QueryParams): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export const apiClient = new ApiClient(env.VITE_API_BASE_URL);

const DEFAULT_BASE_URL = env.VITE_API_BASE_URL;
const DEFAULT_REFRESH_PATH = "/api/auth/refresh";

export interface HttpClientOptions {
  baseURL?: string;
  refreshPath?: string;
  refresh?: () => Promise<string>;
  onUnauthorized?: () => void;
}

export interface HttpInit extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export interface HttpClient {
  request<T = unknown>(path: string, init?: HttpInit): Promise<T>;
  get<T = unknown>(path: string, init?: HttpInit): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, init?: HttpInit): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown, init?: HttpInit): Promise<T>;
  delete<T = unknown>(path: string, init?: HttpInit): Promise<T>;
}

function isRawBody(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  );
}

function normalize(init: HttpInit = {}): RequestInit {
  const { body, credentials, ...rest } = init;
  const withCredentials: RequestInit = {
    ...rest,
    credentials: credentials ?? "omit",
  };

  if (body === undefined || body === null) {
    return withCredentials;
  }

  if (isRawBody(body)) {
    return { ...withCredentials, body };
  }

  const mergedHeaders = new Headers(rest.headers);
  if (!mergedHeaders.has("Content-Type")) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  return {
    ...withCredentials,
    headers: mergedHeaders,
    body: JSON.stringify(body),
  };
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function sendRequest(ctx: ApiRequest): Promise<Response> {
  try {
    return await fetch(ctx.url, ctx.options);
  } catch (cause) {
    const err = new ApiError({
      status: 0,
      code: "NETWORK",
      message: "Network connection failed.",
      cause,
    });
    reportApiError(err, { url: ctx.url });
    throw err;
  }
}

async function failWith(
  response: Response,
  ctx: ApiRequest,
  extra?: Record<string, unknown>,
): Promise<never> {
  const err = await toApiError(response);
  reportApiError(err, { url: ctx.url, ...extra });
  throw err;
}

export function createHttpClient(options: HttpClientOptions = {}): HttpClient {
  const baseURL = options.baseURL ?? DEFAULT_BASE_URL;
  const refresh =
    options.refresh ??
    createRefresher({
      baseURL,
      path: options.refreshPath ?? DEFAULT_REFRESH_PATH,
    });
  const onUnauthorized =
    options.onUnauthorized ?? (() => authTokenStore.clear());

  function buildRequest(path: string, init: HttpInit): ApiRequest {
    return attachAlbumHeader(
      attachAuthHeader({
        url: `${baseURL}${path}`,
        options: normalize(init),
      }),
    );
  }

  async function handleUnauthorized<T>(
    response: Response,
    ctx: ApiRequest,
    retry: () => Promise<T>,
  ): Promise<T> {
    try {
      await refresh();
    } catch {
      onUnauthorized();
      await failWith(response, ctx, { retryFailed: true });
    }
    return retry();
  }

  async function request<T = unknown>(
    path: string,
    init: HttpInit = {},
    isRetry = false,
  ): Promise<T> {
    const ctx = buildRequest(path, init);
    const response = await sendRequest(ctx);

    if (response.status === 401 && !isRetry) {
      return handleUnauthorized(response, ctx, () =>
        request<T>(path, init, true),
      );
    }

    if (!response.ok) {
      await failWith(response, ctx);
    }

    const data = await parseResponse(response);
    return data as T;
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

export const httpClient = createHttpClient();
