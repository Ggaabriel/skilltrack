import { useState, type DragEvent } from "react";
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
import { ChevronRight, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CourseNode } from "@/entities/node";
import { cn } from "@/lib/utils";

type TreeNodeProps = {
  node: CourseNode;
  activeId: string | null;
  allowNesting: boolean;
  draggedNodeId: string | null;
  dropTarget: { nodeId: string; placement: "before" | "inside" } | null;
  isMoving: boolean;
  onDragStart: (nodeId: string) => void;
  onDragEnd: () => void;
  onDragOver: (
    nodeId: string,
    placement: "before" | "inside",
  ) => void;
  onDrop: (
    draggedNodeId: string,
    targetNode: CourseNode,
    placement: "before" | "inside",
  ) => void;
  onSelect: (node: CourseNode) => void;
  onDeleteNode: (node: CourseNode) => void;
};

export function TreeNode({
  node,
  activeId,
  allowNesting,
  draggedNodeId,
  dropTarget,
  isMoving,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onSelect,
  onDeleteNode,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = node.children.length > 0;
  const isDropTarget = dropTarget?.nodeId === node.id;

  function getPlacement(event: DragEvent<HTMLDivElement>) {
    if (!allowNesting) return "before";
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeY = (event.clientY - bounds.top) / bounds.height;
    return relativeY < 0.25 ? "before" : "inside";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    onDragOver(node.id, getPlacement(event));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const sourceId = event.dataTransfer.getData("text/plain");

    if (sourceId && !isMoving) {
      onDrop(sourceId, node, getPlacement(event));
    }
    onDragEnd();
  }

  return (
    <div>
      <ContextMenuPrimitive.Root>
        <ContextMenuPrimitive.Trigger asChild>
          <div
            data-course-tree-node
            className={cn(
              "group relative flex min-w-0 items-center gap-1 rounded-md",
              draggedNodeId === node.id && "opacity-40",
              isDropTarget &&
                dropTarget.placement === "inside" &&
                "bg-accent ring-1 ring-primary",
              isDropTarget &&
                dropTarget.placement === "before" &&
                "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-primary before:content-['']",
            )}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {hasChildren ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 shrink-0"
                aria-label={
                  isExpanded
                    ? `Collapse ${node.title}`
                    : `Expand ${node.title}`
                }
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((current) => !current)}
              >
                <ChevronRight
                  className={cn(
                    "size-3.5 transition-transform",
                    isExpanded && "rotate-90",
                  )}
                />
              </Button>
            ) : (
              <span className="size-7 shrink-0" aria-hidden="true" />
            )}

            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-8 min-w-0 flex-1 cursor-pointer justify-start px-2 text-left",
                draggedNodeId === node.id && "cursor-grabbing",
                activeId === node.id && "bg-accent",
              )}
              draggable={!isMoving}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", node.id);
                event.dataTransfer.effectAllowed = "move";
                onDragStart(node.id);
              }}
              onDragEnd={onDragEnd}
              onClick={() => onSelect(node)}
            >
              <span className="truncate">{node.title}</span>
            </Button>
          </div>
        </ContextMenuPrimitive.Trigger>

        <ContextMenuPrimitive.Portal>
          <ContextMenuPrimitive.Content className="z-50 min-w-32 rounded-xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
            <ContextMenuPrimitive.Item
              className="flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive outline-hidden select-none focus:bg-destructive/10"
              onSelect={() => onDeleteNode(node)}
            >
              <Trash2 className="size-4" />
              Delete
            </ContextMenuPrimitive.Item>
          </ContextMenuPrimitive.Content>
        </ContextMenuPrimitive.Portal>
      </ContextMenuPrimitive.Root>

      {hasChildren && isExpanded && (
        <div className="ml-4 flex flex-col border-l pl-1">
          {node.children.map((child, index) => (
            <div key={child.id} className="contents">
              {index > 0 && (
                <TreeNodeDropGap
                  targetNode={child}
                  isActive={
                    dropTarget?.nodeId === child.id &&
                    dropTarget.placement === "before"
                  }
                  isMoving={isMoving}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                />
              )}
              <TreeNode
                node={child}
                activeId={activeId}
                allowNesting={allowNesting}
                draggedNodeId={draggedNodeId}
                dropTarget={dropTarget}
                isMoving={isMoving}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onSelect={onSelect}
                onDeleteNode={onDeleteNode}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type TreeNodeDropGapProps = {
  targetNode: CourseNode;
  isActive: boolean;
  isMoving: boolean;
  onDragEnd: () => void;
  onDragOver: (
    nodeId: string,
    placement: "before" | "inside",
  ) => void;
  onDrop: (
    draggedNodeId: string,
    targetNode: CourseNode,
    placement: "before" | "inside",
  ) => void;
};

export function TreeNodeDropGap({
  targetNode,
  isActive,
  isMoving,
  onDragEnd,
  onDragOver,
  onDrop,
}: TreeNodeDropGapProps) {
  return (
    <div
      className="relative h-0.5 shrink-0"
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDragOver(targetNode.id, "before");
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const sourceId = event.dataTransfer.getData("text/plain");
        if (sourceId && !isMoving) onDrop(sourceId, targetNode, "before");
        onDragEnd();
      }}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-primary opacity-0",
          isActive && "opacity-100",
        )}
      />
    </div>
  );
}