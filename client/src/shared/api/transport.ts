import { ApiError, reportApiError } from './error';

export type Transport = (url: string, init: RequestInit) => Promise<Response>;
export async function sendRequest(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (cause) {
    const error = new ApiError({
      status: 0,
      code: "NETWORK",
      message: "Network connection failed.",
      cause,
    });

    reportApiError(error, { url });

    throw error;
  }
}