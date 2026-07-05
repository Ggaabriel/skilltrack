const AUTH_TOKEN_STORAGE_KEY = "skilltrack_auth_token";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export const authTokenStore = {
  get(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  },

  set(token: string): void {
    if (!isBrowser()) return;
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  },

  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  },
};
