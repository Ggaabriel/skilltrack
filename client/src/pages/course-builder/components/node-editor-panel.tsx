import { FilePlus2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CourseNode } from "@/entities/node";
import type { Skill } from "@/entities/skill/api/skill.api";
import type { Tag } from "@/entities/tag/api/tag.api";

import { NodeEditor } from "./node-editor";

type NodeEditorPanelProps = {
  node: CourseNode | null;
  availableTags: Tag[];
  availableSkills: Skill[];
  isTagsLoading: boolean;
  isSkillsLoading: boolean;
  onCreateNode?: () => void;
  title: string;
  content: string;
  isSaving: boolean;
  showDelete?: boolean;
  titlePlaceholder?: string;
  deleteLabel?: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSave: (input: { title: string; content: string }) => void;
  onDelete?: () => void;
};

export function NodeEditorPanel({
  node,
  availableTags,
  availableSkills,
  isTagsLoading,
  isSkillsLoading,
  onCreateNode,
  title,
  content,
  isSaving,
  showDelete = true,
  titlePlaceholder,
  deleteLabel,
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
          availableTags={availableTags}
          availableSkills={availableSkills}
          isTagsLoading={isTagsLoading}
          isSkillsLoading={isSkillsLoading}
          title={title}
          content={content}
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
          isSaving={isSaving}
          showDelete={showDelete}
          titlePlaceholder={titlePlaceholder}
          deleteLabel={deleteLabel}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : (
        <div className="flex h-full min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
          <FilePlus2 className="size-8 text-muted-foreground" />
          <div>
            <h2 className="font-medium">Select a node to edit</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tags and skills are managed on each node. Select a node or create
              one to add them.
            </p>
          </div>
          {onCreateNode && (
            <Button type="button" variant="outline" onClick={onCreateNode}>
              <Plus />
              Create node
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
