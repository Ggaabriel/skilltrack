import { httpClient } from "@/shared/api";
import type { IEvent } from "../model/interfaces";
import type { ApiResponse } from "@/shared/api/client";
import type { LoginDto } from "../model/schemas";

/**
 * Auth API endpoints
 */
export const authApi = {
  /**
   * Get a specific event by ID
   * GET /event/{id}
   */
  // getEventById(id: string): Promise<ApiResponse<IEvent>> {
  //   return httpClient.get(`/event/${id}`);
  // },

  login(dto: LoginDto){
    
  }

};
