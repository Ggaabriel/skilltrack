import { eventApi } from "./event.api";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { IEvent } from "../model/interfaces";

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

export const useEventsQuery = (startDate: string, endDate: string) => {
  return useSuspenseQuery({
    queryKey: eventKeys.all,
    queryFn: () => {
      console.log("events query function");
      return eventApi.getUserEvents(startDate, endDate);
    },
  });
};

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: Omit<IEvent, "id">) =>
      eventApi.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.all,
      });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IEvent> }) =>
      eventApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.all,
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.all,
      });
    },
  });
}
