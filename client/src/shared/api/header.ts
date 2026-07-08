import { isRawBody } from "./utils";

export interface ApiRequest {
  url: string;
  options: RequestInit;
}
interface HeadersOptions {
  headers?: HeadersInit;
  token?: string | null;
  body?: unknown;
}

export function buildHeaders({
  headers: initial,
  token,
  body,
}: HeadersOptions) {
  const headers = new Headers(initial);

  headers.set("Accept", "application/json");

  if (body && !isRawBody(body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}
