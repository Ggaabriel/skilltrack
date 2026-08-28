import { eventApi } from "./event.api";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Query keys for event-related queries
 */
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (userId: number, startDate: string, endDate: string) =>
    [...eventKeys.lists(), userId, startDate, endDate] as const,

  details: () => [...eventKeys.all, "details"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

export const useEventsQuery = (
  startDate: string,
  endDate: string,
) => {
  return useSuspenseQuery({
    queryKey: eventKeys.all,
    queryFn: () => {
      console.log("events query function");
      return eventApi.getUserEvents(startDate, endDate);
    },
  });
};
