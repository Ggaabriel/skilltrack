import { useQuery } from "@tanstack/react-query";

import { tagApi } from "./tag.api";

export const tagQueryKeys = {
  all: ["tags"] as const,
  list: () => [...tagQueryKeys.all, "list"] as const,
};

export function useTagsQuery() {
  return useQuery({
    queryKey: tagQueryKeys.list(),
    queryFn: tagApi.getTags,
  });
}