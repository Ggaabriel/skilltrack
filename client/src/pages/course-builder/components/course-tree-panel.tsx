import { LoaderCircle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CourseNode } from "@/entities/node";

import { TreeNode } from "./tree-node";
import { TreeSkeleton } from "./builder-states";

type CourseTreePanelProps = {
  nodes: CourseNode[];
  isLoading: boolean;
  error: string | null;
  activeNodeId: string | null;
  isCreating: boolean;
  onAddRoot: () => void;
  onSelectNode: (node: CourseNode) => void;
  onAddChild: (node: CourseNode | null) => void;
  onDeleteNode: (node: CourseNode) => void;
};

export function CourseTreePanel({
  nodes,
  isLoading,
  error,
  activeNodeId,
  isCreating,
  onAddRoot,
  onSelectNode,
  onAddChild,
  onDeleteNode,
}: CourseTreePanelProps) {
  return (
    <section className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between border-b p-3">
        <h2 className="font-medium">Course tree</h2>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Add root node"
          onClick={onAddRoot}
          disabled={isCreating}
        >
          {isCreating ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Plus />
          )}
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 p-2">
        {isLoading && <TreeSkeleton />}

        {error && <p className="p-2 text-sm text-destructive">{error}</p>}

        {!isLoading && !error && nodes.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No nodes yet. Add the first one to start outlining the course.
          </div>
        )}

        {!isLoading &&
          !error &&
          nodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              activeId={activeNodeId}
              onSelect={onSelectNode}
              onAddChild={onAddChild}
              onDeleteNode={onDeleteNode}
            />
          ))}
      </ScrollArea>
    </section>
  );
}
