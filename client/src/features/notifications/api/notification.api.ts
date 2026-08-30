import { httpClient } from "@/shared/api";
import type { PushSubscriptionDto } from "../model/notification.types";
import type { ApiResponse } from "@/shared/api/client";

export const notificationApi = {
  subscribe: (dto: PushSubscriptionDto): Promise<ApiResponse<null>> =>
    httpClient.post("/notifications/subscriptions", dto),

  unsubscribe: (endpoint: string): Promise<ApiResponse<null>> =>
    httpClient.delete(`/notifications/subscriptions`, {
      body: JSON.stringify({ endpoint }),
    }),
};
