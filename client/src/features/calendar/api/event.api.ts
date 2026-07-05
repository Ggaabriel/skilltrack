import { httpClient, type ApiResponse } from "@/shared/api/client";
import type { IEvent } from "../model/interfaces";

/**
 * Event API endpoints
 */
export const eventApi = {
  /**
   * Get a specific event by ID
   * GET /event/{id}
   */
  getEventById(id: string): Promise<ApiResponse<IEvent>> {
    return httpClient.get(`/event/${id}`);
  },

  /**
   * Get events for a specific user with date range
   * GET /user/{userId}/events?startDate=...&endDate=...
   */
  getUserEvents(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<IEvent[]>> {
    return httpClient.get(`/user/${userId}/events?startDate=${startDate}&endDate=${endDate}`);
  },

  /**
   * Create a new event
   * POST /event
   */
  createEvent(eventData: Omit<IEvent, "id">): Promise<ApiResponse<IEvent>> {
    return httpClient.post("/event", eventData);
  },

  /**
   * Update a specific event
   * PATCH /event/{id}
   */
  updateEvent(
    id: string,
    eventData: Partial<IEvent>,
  ): Promise<ApiResponse<IEvent>> {
    return httpClient.patch(`/event/${id}`, eventData);
  },

  /**
   * Delete a specific event
   * DELETE /event/{id}
   */
  deleteEvent(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`/event/${id}`);
  },
};
