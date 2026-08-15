import { useQuery } from "@tanstack/react-query";
import { userApi } from "./user.api";
import type { UserDto } from "../model/user.schemas";

export const userKeys = {
  me: ["me"] as const,
};

export const useUserMeQuery = () => {
  return useQuery<UserDto | null>({
    queryKey: userKeys.me,
    queryFn: userApi.me,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};
