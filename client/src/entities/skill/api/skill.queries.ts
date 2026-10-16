import { useQuery } from "@tanstack/react-query";

import { skillApi } from "./skill.api";

export const skillQueryKeys = {
  all: ["skills"] as const,
  list: () => [...skillQueryKeys.all, "list"] as const,
};

export function useSkillsQuery() {
  return useQuery({
    queryKey: skillQueryKeys.list(),
    queryFn: skillApi.getSkills,
  });
}