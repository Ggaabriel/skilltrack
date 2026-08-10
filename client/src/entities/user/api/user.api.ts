import type { ApiResponse } from "@/shared/api/client";
import type { UserDto } from "../model/user.schemas";
import { httpClient } from "@/shared/api";

export const userApi = {
  /**
   * me
   * GET /user/me
   * @param dto id+email+name+picturePath
   */
  me(): Promise<ApiResponse<UserDto>> {
    return httpClient.get("/user/me");
  },
};
