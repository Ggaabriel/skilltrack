import { useMutation, useQueryClient } from "@tanstack/react-query";

import { tagApi, type Tag } from "./tag.api";
import { tagQueryKeys } from "./tag.queries";

export function useCreateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagApi.createTag,

    onSuccess: (createdTag) => {
      queryClient.setQueryData<Tag[]>(
        tagQueryKeys.list(),
        (current = []) => {
          if (current.some((tag) => tag.id === createdTag.id)) {
            return current;
          }

          return [...current, createdTag].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        },
      );
    },
  });
}