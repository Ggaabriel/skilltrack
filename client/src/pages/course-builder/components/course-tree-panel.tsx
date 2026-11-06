import { LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CourseNode } from "@/entities/node";

import { TreeNode, TreeNodeDropGap } from "./tree-node";
import { TreeSkeleton } from "./builder-states";

type CourseTreePanelProps = {
  nodes: CourseNode[];
  isLoading: boolean;
  error: string | null;
  activeNodeId: string | null;
  isCreating: boolean;
  isMoving: boolean;
  onAddNode: () => void;
  onSelectNode: (node: CourseNode) => void;
  onClearSelection: () => void;
  onDeleteNode: (node: CourseNode) => void;
  onMoveNodeToRoot: (draggedNodeId: string, position: "start" | "end") => void;
  title?: string;
  addNodeLabel?: string;
  emptyMessage?: string;
  allowNesting?: boolean;
  onMoveNode: (
    draggedNodeId: string,
    targetNode: CourseNode,
    placement: "before" | "inside",
  ) => void;
};

export function CourseTreePanel({
  nodes,
  isLoading,
  error,
  activeNodeId,
  isCreating,
  isMoving,
  onAddNode,
  onSelectNode,
  onClearSelection,
  onDeleteNode,
  onMoveNodeToRoot,
  onMoveNode,
  title = "Course tree",
  addNodeLabel = "Add node to selected node",
  emptyMessage = "No nodes yet. Add the first one to start outlining the course.",
  allowNesting = true,
}: CourseTreePanelProps) {
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    nodeId: string;
    placement: "before" | "inside";
  } | null>(null);
  const [rootDropPosition, setRootDropPosition] = useState<
    "start" | "end" | null
  >(null);

  function finishDrag() {
    setDraggedNodeId(null);
    setDropTarget(null);
    setRootDropPosition(null);
  }

  function handleRootDragOver(
    event: React.DragEvent<HTMLDivElement>,
    position: "start" | "end",
  ) {
    event.preventDefault();
    setDropTarget(null);
    setRootDropPosition(position);
  }

  function handleRootDrop(
    event: React.DragEvent<HTMLDivElement>,
    position: "start" | "end",
  ) {
    event.preventDefault();
    event.stopPropagation();
    const sourceId = event.dataTransfer.getData("text/plain");
    if (sourceId && !isMoving) onMoveNodeToRoot(sourceId, position);
    finishDrag();
  }

  function handleEmptySpaceClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element)) return;
    const viewport = event.currentTarget.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    if (!viewport?.contains(event.target)) return;
    if (event.target.closest("[data-course-tree-node]")) return;
    onClearSelection();
  }

  return (
    <section className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
      <div className="flex shrink-0 items-center justify-between border-b p-3">
        <h2 className="font-medium">{title}</h2>

        <Button
          size="icon"
          variant="ghost"
          aria-label={addNodeLabel}
          title={addNodeLabel}
          onClick={onAddNode}
          disabled={isCreating}
        >
          {isCreating ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Plus />
          )}
        </Button>
      </div>

      <ScrollArea
        className="min-h-0 flex-1 p-2"
        onClick={handleEmptySpaceClick}
      >
        {isLoading && <TreeSkeleton />}

        {error && <p className="p-2 text-sm text-destructive">{error}</p>}

        {!isLoading && !error && nodes.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}

        {!isLoading && !error && (
          <div className="flex min-h-full flex-col">
            <div
              className={`h-5 shrink-0 rounded-sm transition-colors ${
                rootDropPosition === "start" ? "bg-primary/20" : ""
              }`}
              onDragOver={(event) => handleRootDragOver(event, "start")}
              onDrop={(event) => handleRootDrop(event, "start")}
              aria-label="Move node to the beginning of the course"
            />

            {nodes.map((node, index) => (
              <div key={node.id} className="contents">
                {index > 0 && (
                  <TreeNodeDropGap
                    targetNode={node}
                    isActive={
                      dropTarget?.nodeId === node.id &&
                      dropTarget.placement === "before"
                    }
                    isMoving={isMoving}
                    onDragEnd={finishDrag}
                    onDragOver={(nodeId, placement) => {
                      setRootDropPosition(null);
                      setDropTarget({ nodeId, placement });
                    }}
                    onDrop={onMoveNode}
                  />
                )}
                <TreeNode
                  node={node}
                  activeId={activeNodeId}
                  allowNesting={allowNesting}
                  draggedNodeId={draggedNodeId}
                  dropTarget={dropTarget}
                  isMoving={isMoving}
                  onDragStart={setDraggedNodeId}
                  onDragEnd={finishDrag}
                  onDragOver={(nodeId, placement) => {
                    setRootDropPosition(null);
                    setDropTarget({ nodeId, placement });
                  }}
                  onDrop={onMoveNode}
                  onSelect={onSelectNode}
                  onDeleteNode={onDeleteNode}
                />
              </div>
            ))}

            <div
              className={`min-h-10 flex-1 rounded-sm transition-colors ${
                rootDropPosition === "end" ? "bg-primary/20" : ""
              }`}
              onDragOver={(event) => handleRootDragOver(event, "end")}
              onDrop={(event) => handleRootDrop(event, "end")}
              aria-label="Move node to the end of the course"
            />
          </div>
        )}
      </ScrollArea>
    </section>
  );
}
