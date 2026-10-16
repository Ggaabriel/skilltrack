import { useMutation, useQueryClient } from "@tanstack/react-query";

import { skillApi, type Skill } from "./skill.api";
import { skillQueryKeys } from "./skill.queries";

export function useCreateSkillMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: skillApi.createSkill,

    onSuccess: (createdSkill) => {
      queryClient.setQueryData<Skill[]>(
        skillQueryKeys.list(),
        (current = []) => {
          if (current.some((skill) => skill.id === createdSkill.id)) {
            return current;
          }

          return [...current, createdSkill].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        },
      );
    },
  });
}
