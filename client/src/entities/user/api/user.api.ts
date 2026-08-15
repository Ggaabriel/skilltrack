import type { ApiResponse } from "@/shared/api/client";
import type { UserDto } from "../model/user.schemas";
import { httpClient } from "@/shared/api";

export const userApi = {
  /**
   * me
   * GET /user/me
   * @param dto id+email+name+picturePath
   */
  me: async (): Promise<UserDto> => {
    const response = await httpClient.get<ApiResponse<UserDto>>("/user/me");
    return response.data;
  },
};
