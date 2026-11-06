import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nodeProgressApi } from "./node-progress.api";

export const nodeProgressKeys = {
  all: ["node-progress"] as const,
  course: (courseId: number) =>
    [...nodeProgressKeys.all, "course", courseId] as const,
  summaries: () => [...nodeProgressKeys.all, "summaries"] as const,
};

export function useNodeProgressQuery(courseId: number | null) {
  return useQuery({
    queryKey: nodeProgressKeys.course(courseId ?? 0),
    queryFn: () => nodeProgressApi.getForCourse(courseId!),
    enabled: courseId !== null,
  });
}

export function useCourseProgressSummariesQuery(enabled = true) {
  return useQuery({
    queryKey: nodeProgressKeys.summaries(),
    queryFn: nodeProgressApi.getCourseProgressSummaries,
    enabled,
  });
}

export function useResetCourseProgressMutation(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => nodeProgressApi.resetForCourse(courseId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: nodeProgressKeys.course(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: nodeProgressKeys.summaries(),
        }),
      ]);
    },
  });
}

export function useRemoveCourseFromProgressMutation(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => nodeProgressApi.removeFromProgress(courseId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: nodeProgressKeys.course(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: nodeProgressKeys.summaries(),
        }),
      ]);
    },
  });
}

export function useSetNodeProgressMutation(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      nodeId,
      percentage,
    }: {
      nodeId: number;
      percentage: number;
    }) => nodeProgressApi.setForNode(nodeId, percentage),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: nodeProgressKeys.course(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: nodeProgressKeys.summaries(),
        }),
      ]);
    },
  });
}
