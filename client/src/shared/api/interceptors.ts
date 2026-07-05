import { authTokenStore } from "./auth-token";

export interface ApiRequest {
  url: string;
  options: RequestInit;
}

export function attachAuthHeader(ctx: ApiRequest): ApiRequest {
  const token = authTokenStore.get();
  if (!token) {
    return ctx;
  }

  const headers = new Headers(ctx.options.headers ?? undefined);
  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    ...ctx,
    options: {
      ...ctx.options,
      headers,
    },
  };
}

export function attachAlbumHeader(ctx: ApiRequest): ApiRequest {
  return ctx;
}
