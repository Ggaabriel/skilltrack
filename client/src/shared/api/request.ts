import type { HttpInit } from "./client";
import { buildHeaders } from "./header";
import { serializeBody } from "./utils";

export function buildRequest(init: HttpInit = {}, token?: string | null): RequestInit {
  const headers = buildHeaders({
    headers: init.headers,
    token,
    body: init.body,
  });

  return {
    ...init,
    headers,
    body: serializeBody(init.body),
    credentials: init.credentials ?? "include",
  };
}
