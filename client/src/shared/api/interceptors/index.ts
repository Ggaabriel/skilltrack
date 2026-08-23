import type { RequestContext } from "../client";

export type Interceptor = (
  ctx: RequestContext,
  next: () => Promise<Response>,
  retry: () => Promise<Response>,
) => Promise<Response>;

export async function runInterceptors(
  ctx: RequestContext,
  interceptors: Interceptor[],
  handler: () => Promise<Response>,
): Promise<Response> {
  async function dispatch(position: number): Promise<Response> {
    const interceptor = interceptors[position];

    if (!interceptor) {
      return handler();
    }

    let nextCalled = false;

    const next = async () => {
      if (nextCalled) {
        throw new Error("next() called multiple times");
      }

      nextCalled = true;

      return dispatch(position + 1);
    };

    const retry = () => dispatch(0);

    return interceptor(ctx, next, retry);
  }

  return dispatch(0);
}