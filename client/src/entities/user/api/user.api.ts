import type { ApiResponse } from "@/shared/api/client";
import type { UserDto } from "../model/user.schemas";
import { httpClient } from "@/shared/api";

export type PublicUserProfile = {
  id: number;
  name: string;
  picturePath: string | null;
  publishedCourses: {
    id: number;
    title: string;
    type: string;
  }[];
};

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
  publicProfile: async (id: string): Promise<PublicUserProfile> => {
    const response = await httpClient.get<PublicUserProfile>(
      `/public-users/${id}`,
    );
    return response;
  },
};
