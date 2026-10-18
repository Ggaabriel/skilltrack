import type { CourseNode } from "@/entities/node";

export function findNode(
  nodes: CourseNode[],
  id: string | null,
): CourseNode | null {
  if (!id) return null;

  for (const node of nodes) {
    if (node.id === id) return node;

    const child = findNode(node.children, id);
    if (child) return child;
  }

  return null;
}
