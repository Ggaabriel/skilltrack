import { useQuery } from "@tanstack/react-query";
import { userApi } from "./user.api";
import type { UserDto } from "../model/user.schemas";

export const userKeys = {
  me: ["me"] as const,
  publicProfile: (id: string) => ["users", "public-profile", id] as const,
};

export const useUserMeQuery = () => {
  return useQuery<UserDto>({
    queryKey: userKeys.me,
    queryFn: userApi.me,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};

export function usePublicUserProfileQuery(id: string) {
  return useQuery({
    queryKey: userKeys.publicProfile(id),
    queryFn: () => userApi.publicProfile(id),
    enabled: /^\d+$/.test(id) && Number(id) > 0,
  });
}
