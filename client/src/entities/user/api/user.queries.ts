import { useQuery } from "@tanstack/react-query";
import { userApi } from "./user.api";
import type { UserDto } from "../model/user.schemas";
import type { ApiResponse } from "@/shared/api/client";

export const userKeys = {
  me: ["me"] as const,
};

export const useUserMeQuery = () => {
  return useQuery<ApiResponse<UserDto> | null>({
    queryKey: userKeys.me,
    queryFn: userApi.me,
    retry: false,
  });
};
