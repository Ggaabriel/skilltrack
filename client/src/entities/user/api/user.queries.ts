import { useQuery } from "@tanstack/react-query";
import { userApi } from "./user.api";

export const userKeys = {
  me: ["me"] as const,
};

export const useUserMeQuery = () => {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: userApi.me,
  });
};
