import { httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api/client";
import type { LoginDto, RegisterDto } from "../model/schemas";

type TAccessToken = { accessToken: string };

/**
 * Auth API endpoints
 */
export const authApi = {
  /**
   * LogIn
   * POST /auth/login
   * @param dto email+password
   */
  login(dto: LoginDto): Promise<ApiResponse<TAccessToken>> {
    return httpClient.post("/auth/login", dto);
  },

  /**
   * Register
   * POST /auth/register
   * @param dto email+password+name
   */
  register(dto: RegisterDto): Promise<ApiResponse<TAccessToken>> {
    return httpClient.post("auth/register", dto);
  },

  /**
   * Refresh
   * POST /auth/refresh
   */
  refresh(): Promise<ApiResponse<{ data: null }>> {
    return httpClient.post("auth/refresh");
  },

  /**
   * logout
   * POST /auth/logout
   */
  logout(): Promise<ApiResponse<{ data: null }>> {
    return httpClient.post("auth/logout");
  },
};
