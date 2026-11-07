import { Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { CourseSkill, CourseTag } from "@/entities/course/api/types";
import {
  useUpdateCourseSkillsMutation,
  useUpdateCourseTagsMutation,
} from "@/entities/course/api/course.mutations";
import type { Skill } from "@/entities/skill/api/skill.api";
import { useCreateSkillMutation } from "@/entities/skill/api/skill.mutations";
import type { Tag } from "@/entities/tag/api/tag.api";
import { useCreateTagMutation } from "@/entities/tag/api/tag.mutations";
import { CreatableMultiSelect } from "@/features/course/create-course";

type CourseMetadataEditorProps = {
  courseId: string;
  tags: CourseTag[];
  skills: CourseSkill[];
  availableTags: Tag[];
  availableSkills: Skill[];
  isTagsLoading: boolean;
  isSkillsLoading: boolean;
  disabled?: boolean;
};

export function CourseMetadataEditor({
  courseId,
  tags,
  skills,
  availableTags,
  availableSkills,
  isTagsLoading,
  isSkillsLoading,
  disabled = false,
}: CourseMetadataEditorProps) {
  const [selectedTagIds, setSelectedTagIds] = useState(() =>
    tags.map(({ id }) => id),
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState(() =>
    skills.map(({ id }) => id),
  );
  const updateTags = useUpdateCourseTagsMutation();
  const updateSkills = useUpdateCourseSkillsMutation();
  const createTag = useCreateTagMutation();
  const createSkill = useCreateSkillMutation();
  const isSaving =
    updateTags.isPending ||
    updateSkills.isPending ||
    createTag.isPending ||
    createSkill.isPending;
  const originalTagIds = tags.map(({ id }) => id);
  const originalSkillIds = skills.map(({ id }) => id);
  const hasTagChanges =
    selectedTagIds.length !== originalTagIds.length ||
    selectedTagIds.some((id) => !originalTagIds.includes(id));
  const hasSkillChanges =
    selectedSkillIds.length !== originalSkillIds.length ||
    selectedSkillIds.some((id) => !originalSkillIds.includes(id));

  async function saveTags() {
    try {
      await updateTags.mutateAsync({ id: courseId, tagIds: selectedTagIds });
      toast.success("Course tags saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save tags.",
      );
    }
  }

  async function saveSkills() {
    try {
      await updateSkills.mutateAsync({
        id: courseId,
        skillIds: selectedSkillIds,
      });
      toast.success("Course skills saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save skills.",
      );
    }
  }

  return (
    <div className="space-y-3">
      {disabled && (
        <p className="text-xs text-muted-foreground">
          Create a node before assigning course-wide tags and skills.
        </p>
      )}
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
          disabled={isSaving || disabled}
          layout="horizontal"
        />
        {hasTagChanges && (
          <div className="mt-2 flex justify-end gap-1">
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Discard course tag changes"
              disabled={isSaving || disabled}
              onClick={() => setSelectedTagIds(originalTagIds)}
            >
              <X />
            </Button>
            <Button
              type="button"
              size="sm"
              aria-label="Save course tag changes"
              disabled={isSaving || disabled || isTagsLoading}
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
          disabled={isSaving || disabled}
          layout="horizontal"
        />
        {hasSkillChanges && (
          <div className="mt-2 flex justify-end gap-1">
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Discard course skill changes"
              disabled={isSaving || disabled}
              onClick={() => setSelectedSkillIds(originalSkillIds)}
            >
              <X />
            </Button>
            <Button
              type="button"
              size="sm"
              aria-label="Save course skill changes"
              disabled={isSaving || disabled || isSkillsLoading}
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
