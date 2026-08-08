import type { LoginDto } from "../model/schemas";
import { authApi } from "./auth.api";
import { eventApi } from "./event.api";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

/**
 * Query keys for event-related queries
 */
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (startDate: string, endDate: string) =>
    [...eventKeys.lists(), startDate, endDate] as const,
  details: () => [...eventKeys.all, "details"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

export const useEventsQuery = (startDate: string, endDate: string) => {
  return useSuspenseQuery({
    queryKey: eventKeys.list(startDate, endDate),
    queryFn: () => eventApi.getUserEvents("1", startDate, endDate),
  });
};

export const authKeys = {
  login: ["login"] as const
}

export const useLoginQuery = (dto: LoginDto) => {
  return useMutation({
    mutationFn: () => authApi.login(dto),
    mutationKey: authKeys.login,
    onSuccess: () => {
      
    }
  })
}