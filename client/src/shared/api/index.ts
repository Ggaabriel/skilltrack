import { env } from "../config/env";
import { authTokenStore } from "./auth/authToken";
import { createRefresher } from "./auth/refresh";
import { createHttpClient } from "./client";
import {
  createAuthInterceptor,
} from "./interceptors/auth.interceptor";
import { sendRequest } from "./transport";

const baseURL = env.VITE_API_BASE_URL;

const refresh = createRefresher({
  baseURL,
  path: "/auth/refresh",
});

export const httpClient = createHttpClient({
  options: {
    baseURL,
    onUnauthorized: () => authTokenStore.clear(),
  },
  interceptors: [
    createAuthInterceptor({
      refresh,
    }),
  ],
  transport: sendRequest,
});
