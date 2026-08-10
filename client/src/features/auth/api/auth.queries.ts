import { useMutation } from "@tanstack/react-query";
import type { LoginDto } from "../model/schemas";
import { authApi } from "./auth.api";

export function useLogin() {
  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
  });
}
