import { useAccess } from "./useAccess";

export function useRequiredUser() {
  const { user } = useAccess();

  if (!user) {
    throw new Error("useRequiredUser must be used inside RequireAuth");
  }

  return user;
}