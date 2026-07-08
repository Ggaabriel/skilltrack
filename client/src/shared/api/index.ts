import { authTokenStore } from "./auth/authToken";
import { createHttpClient } from "./client";

export const httpClient = createHttpClient({
  onUnauthorized: () => authTokenStore.clear(),
});