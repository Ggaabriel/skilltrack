import { useUserMeQuery } from "@/entities/user/api/user.queries";

export function useAccess() {
  const { data: user, isPending } = useUserMeQuery();

  return {
    user,
    isPending,
    isAuthenticated: !!user,
  };
}
