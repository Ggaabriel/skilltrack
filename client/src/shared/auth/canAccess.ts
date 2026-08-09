import type { Access } from "./access";

export function canAccess(
  access: Access,
  isAuthenticated: boolean,
): boolean {
  if (access === "authenticated") {
    return isAuthenticated;
  }

  return !isAuthenticated;
}