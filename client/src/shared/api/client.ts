import { reportApiError, toApiError } from "./error";
import { runInterceptors, type Interceptor } from "./interceptors";
import { buildRequest } from "./request";
import { parseResponse } from "./response";
import type { Transport } from "./transport";

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
type HttpBody = JsonBody | BodyInit | null;
export interface HttpInit extends Omit<RequestInit, "body"> {
  body?: HttpBody;
}

export interface HttpClient {
  request<T = unknown>(path: string, init?: HttpInit): Promise<T>;
  get<T = unknown>(path: string, init?: HttpInit): Promise<T>;
  post<T = unknown>(path: string, body?: HttpBody, init?: HttpInit): Promise<T>;
  patch<T = unknown>(
    path: string,
    body?: HttpBody,
    init?: HttpInit,
  ): Promise<T>;
  delete<T = unknown>(path: string, init?: HttpInit): Promise<T>;
}
export interface RequestContext {
  url: string;
  init: RequestInit;

  retry?: boolean;

  metadata?: Record<string, unknown>;
}

export function createHttpClient({
  options = {},
  interceptors,
  transport,
}: {
  options?: HttpClientOptions;
  interceptors: Interceptor[];
  transport: Transport;
}): HttpClient {
  const baseURL = options.baseURL;

  async function request<T>(path: string, init: HttpInit = {}): Promise<T> {
    const ctx: RequestContext = {
      url: baseURL + path,
      init: buildRequest(init),
    };

    const response = await runInterceptors(ctx, interceptors, () =>
      transport(ctx.url, ctx.init),
    );
    if (!response.ok) {
      const error = await toApiError(response);

      reportApiError(error, {
        url: ctx.url,
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
