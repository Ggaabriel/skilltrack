import { useMutation } from "@tanstack/react-query";
import type { LoginDto } from "../model/schemas";
import { authApi } from "./auth.api";

export const authKeys = {
  login: ["auth", "login"] as const,
};

export function useLogin() {
  return useMutation({
    mutationKey: authKeys.login,
    mutationFn: (dto: LoginDto) => authApi.login(dto),
  });
}