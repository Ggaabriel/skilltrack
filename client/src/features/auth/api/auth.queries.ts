import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginDto } from "../model/schemas";
import { authApi } from "../api/auth.api";
import { userKeys } from "@/entities/user/api/user.queries";
import { authTokenStore } from "@/shared/api/auth/authToken";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),

    onSuccess: async (data) => {
      authTokenStore.set(data.data.accessToken)
      await queryClient.invalidateQueries({
        queryKey: userKeys.me,
      });
    },
  });
}
