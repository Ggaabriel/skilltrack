import type { Interceptor } from "./";
import { authTokenStore } from "../auth/authToken";
import type { RequestContext } from "../client";

function attachAccessToken(ctx: RequestContext) {
  const token = authTokenStore.get();

  if (!token) {
    return;
  }

  const headers = new Headers(ctx.init.headers);

  headers.set("Authorization", `Bearer ${token}`);

  ctx.init.headers = headers;
}

export function createAuthInterceptor(options: {
  refresh: () => Promise<string>;
}): Interceptor {
  return async (ctx, next) => {
    attachAccessToken(ctx);

    const response = await next();

    if (response.status !== 401 || ctx.retry) {
      return response;
    }

    ctx.retry = true;

    try {
      await options.refresh();

      attachAccessToken(ctx);

      return next();
    } catch (error) {
      authTokenStore.clear();

      throw error;
    }
  };
}
