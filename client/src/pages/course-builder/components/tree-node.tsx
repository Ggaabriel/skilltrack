import { useState } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CourseNode } from "@/entities/node";
import { cn } from "@/lib/utils";

type TreeNodeProps = {
  node: CourseNode;
  activeId: string | null;
  onSelect: (node: CourseNode) => void;
  onAddChild: (node: CourseNode) => void;
  onDeleteNode: (node: CourseNode) => void;
};

export function TreeNode({
  node,
  activeId,
  onSelect,
  onAddChild,
  onDeleteNode,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div className="group flex min-w-0 items-center gap-1">
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
          <span
            className="size-7 shrink-0"
            aria-hidden="true"
          />
        )}

        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-8 min-w-0 flex-1 justify-start px-2 text-left",
            activeId === node.id && "bg-accent",
          )}
          onClick={() => onSelect(node)}
        >
          <span className="truncate">{node.title}</span>
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Add child to ${node.title}`}
          title="Add child"
          onClick={() => onAddChild(node)}
        >
          <Plus className="size-3.5" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
          aria-label={`Delete ${node.title}`}
          title="Delete node"
          onClick={() => onDeleteNode(node)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-4 border-l pl-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              activeId={activeId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDeleteNode={onDeleteNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}