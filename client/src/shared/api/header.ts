import { isRawBody } from "./utils";

export interface ApiRequest {
  url: string;
  options: RequestInit;
}
export interface HeadersOptions {
  headers?: HeadersInit;
  body?: unknown;
}

export function buildHeaders({
  headers: initial,
  body,
}: HeadersOptions): Headers {
  const headers = new Headers(initial);

  headers.set("Accept", "application/json");

  if (
    body !== undefined &&
    body !== null &&
    !isRawBody(body) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}
