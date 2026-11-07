import { Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { CourseNode } from "@/entities/node";
import {
  useUpdateNodeSkillsMutation,
  useUpdateNodeTagsMutation,
} from "@/entities/node/api/node.queries";
import type { Skill } from "@/entities/skill/api/skill.api";
import { useCreateSkillMutation } from "@/entities/skill/api/skill.mutations";
import type { Tag } from "@/entities/tag/api/tag.api";
import { useCreateTagMutation } from "@/entities/tag/api/tag.mutations";
import { CreatableMultiSelect } from "@/features/course/create-course";

type NodeMetadataEditorProps = {
  node: CourseNode;
  availableTags: Tag[];
  availableSkills: Skill[];
  isTagsLoading: boolean;
  isSkillsLoading: boolean;
};

export function NodeMetadataEditor({
  node,
  availableTags,
  availableSkills,
  isTagsLoading,
  isSkillsLoading,
}: NodeMetadataEditorProps) {
  const [selectedTagIds, setSelectedTagIds] = useState(() =>
    node.tags.map((tag) => tag.id),
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState(() =>
    node.skills.map((skill) => skill.id),
  );

  const updateTags = useUpdateNodeTagsMutation(Number(node.courseId));
  const updateSkills = useUpdateNodeSkillsMutation(Number(node.courseId));
  const createTag = useCreateTagMutation();
  const createSkill = useCreateSkillMutation();
  const isSaving =
    updateTags.isPending ||
    updateSkills.isPending ||
    createTag.isPending ||
    createSkill.isPending;

  const originalTagIds = node.tags.map((tag) => tag.id);
  const originalSkillIds = node.skills.map((skill) => skill.id);
  const hasTagChanges =
    selectedTagIds.length !== originalTagIds.length ||
    selectedTagIds.some((id) => !originalTagIds.includes(id));
  const hasSkillChanges =
    selectedSkillIds.length !== originalSkillIds.length ||
    selectedSkillIds.some((id) => !originalSkillIds.includes(id));

  async function saveTags() {
    try {
      await updateTags.mutateAsync({ id: node.id, tagIds: selectedTagIds });
      toast.success("Node tags saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save tags.",
      );
    }
  }

  async function saveSkills() {
    try {
      await updateSkills.mutateAsync({
        id: node.id,
        skillIds: selectedSkillIds,
      });
      toast.success("Node skills saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save skills.",
      );
    }
  }

  return (
    <div className="space-y-4 border-b pb-4">
      <div>
        <h2 className="font-medium">Tags and skills for this node</h2>
        <p className="text-sm text-muted-foreground">
          Select existing metadata or create a new entry, then save it to this
          node.
        </p>
      </div>
      <section>
        <CreatableMultiSelect
          label="Tags"
          placeholder="Selected: 0"
          searchPlaceholder="Search or enter a tag..."
          createLabel="Create tag"
          items={availableTags}
          selectedIds={selectedTagIds}
          onSelectedIdsChange={setSelectedTagIds}
          onCreate={(name) => createTag.mutateAsync(name)}
          isLoading={isTagsLoading}
          isCreating={createTag.isPending}
          disabled={isSaving}
        />
        {hasTagChanges && (
          <div className="mt-2 flex justify-end gap-1">
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Discard tag changes"
              disabled={isSaving}
              onClick={() => setSelectedTagIds(originalTagIds)}
            >
              <X />
            </Button>
            <Button
              type="button"
              size="sm"
              aria-label="Save tag changes"
              disabled={isSaving || isTagsLoading}
              onClick={() => void saveTags()}
            >
              <Save />
              Save tags
            </Button>
          </div>
        )}
      </section>

      <section>
        <CreatableMultiSelect
          label="Skills"
          placeholder="Selected: 0"
          searchPlaceholder="Search or enter a skill..."
          createLabel="Create skill"
          items={availableSkills}
          selectedIds={selectedSkillIds}
          onSelectedIdsChange={setSelectedSkillIds}
          onCreate={(name) => createSkill.mutateAsync(name)}
          isLoading={isSkillsLoading}
          isCreating={createSkill.isPending}
          disabled={isSaving}
        />
        {hasSkillChanges && (
          <div className="mt-2 flex justify-end gap-1">
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Discard skill changes"
              disabled={isSaving}
              onClick={() => setSelectedSkillIds(originalSkillIds)}
            >
              <X />
            </Button>
            <Button
              type="button"
              size="sm"
              aria-label="Save skill changes"
              disabled={isSaving || isSkillsLoading}
              onClick={() => void saveSkills()}
            >
              <Save />
              Save skills
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
