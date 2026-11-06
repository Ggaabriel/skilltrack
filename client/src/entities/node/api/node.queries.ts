import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { nodeApi } from "./node.api";
import { courseQueryKeys } from "@/entities/course/api/course.queries";
import { nodeProgressKeys } from "@/entities/node-progress";
import type { CreateNodeInput, MoveNodeInput, UpdateNodeInput } from "./types";

export const nodeQueryKeys = {
  all: ["nodes"] as const,
  tree: (courseId: number) => [...nodeQueryKeys.all, "tree", courseId] as const,
};

function invalidateCourseContent(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: number,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: nodeQueryKeys.tree(courseId) }),
    queryClient.invalidateQueries({
      queryKey: courseQueryKeys.publishedDetail(String(courseId)),
    }),
    queryClient.invalidateQueries({
      queryKey: nodeProgressKeys.summaries(),
    }),
  ]);
}

export function useNodesQuery(courseId: number | null) {
  return useQuery({
    queryKey: nodeQueryKeys.tree(courseId ?? 0),
    queryFn: () => nodeApi.getNodes(courseId!),
    enabled: courseId !== null,
  });
}

export function useCreateNodeMutation(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateNodeInput, "courseId">) =>
      nodeApi.createNode({ ...input, courseId }),
    onSuccess: () => invalidateCourseContent(queryClient, courseId),
  });
}

export function useUpdateNodeMutation(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNodeInput }) =>
      nodeApi.updateNode(id, input),
    onSuccess: () => invalidateCourseContent(queryClient, courseId),
  });
}

export function useMoveNodeMutation(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MoveNodeInput }) =>
      nodeApi.moveNode(id, input),
    onSuccess: () => invalidateCourseContent(queryClient, courseId),
  });
}

export function useDeleteNodeMutation(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: nodeApi.deleteNode,
    onSuccess: () => invalidateCourseContent(queryClient, courseId),
  });
}
