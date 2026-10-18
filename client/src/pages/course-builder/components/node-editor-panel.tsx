import { FilePlus2 } from "lucide-react";

import type { CourseNode } from "@/entities/node";

import { NodeEditor } from "./node-editor";

type NodeEditorPanelProps = {
  node: CourseNode | null;
  title: string;
  content: string;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSave: (input: { title: string; content: string }) => void;
  onDelete: () => void;
};

export function NodeEditorPanel({
  node,
  title,
  content,
  isSaving,
  onTitleChange,
  onContentChange,
  onSave,
  onDelete,
}: NodeEditorPanelProps) {
  return (
    <section className="min-h-0 border-b lg:border-r lg:border-b-0">
      {node ? (
        <NodeEditor
          key={node.id}
          node={node}
          title={title}
          content={content}
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
          isSaving={isSaving}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : (
        <div className="flex h-full min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
          <FilePlus2 className="size-8 text-muted-foreground" />
          <div>
            <h2 className="font-medium">Select a node to edit</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a node in the tree or create a new one.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
