import type { RequestContext } from "../client";

export type Interceptor = (
  ctx: RequestContext,
  next: () => Promise<Response>,
) => Promise<Response>;

export async function runInterceptors(
  ctx: RequestContext,
  interceptors: Interceptor[],
  handler: () => Promise<Response>,
): Promise<Response> {
  let index = -1;

  async function dispatch(position: number): Promise<Response> {
    if (position <= index) {
      throw new Error("next() called multiple times");
    }

    index = position;

    const interceptor = interceptors[position];

    if (!interceptor) {
      return handler();
    }

    return interceptor(ctx, () => dispatch(position + 1));
  }

  return dispatch(0);
}
