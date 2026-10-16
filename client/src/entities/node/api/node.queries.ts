import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { nodeApi } from "./node.api";
import type { CreateNodeInput, UpdateNodeInput } from "./types";

export const nodeQueryKeys = {
  all: ["nodes"] as const,
  tree: (courseId: number) => [...nodeQueryKeys.all, "tree", courseId] as const,
};

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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: nodeQueryKeys.tree(courseId) }),
  });
}

export function useUpdateNodeMutation(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNodeInput }) =>
      nodeApi.updateNode(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: nodeQueryKeys.tree(courseId) }),
  });
}

export function useDeleteNodeMutation(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: nodeApi.deleteNode,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: nodeQueryKeys.tree(courseId) }),
  });
}
