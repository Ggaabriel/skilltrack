import { Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUpdateCourseTagsMutation } from "@/entities/course/api/course.mutations";
import type { CourseTag } from "@/entities/course/api/types";
import type { Tag } from "@/entities/tag/api/tag.api";
import { useCreateTagMutation } from "@/entities/tag/api/tag.mutations";
import { CreatableMultiSelect } from "../../create-course";
import type { CreatableMultiSelectLayout } from "../../create-course/ui/creatable-multi-select";

type CourseTagsEditorProps = {
  courseId: string;
  tags: CourseTag[];
  availableTags: Tag[];
  isLoading?: boolean;
  layout?: CreatableMultiSelectLayout;
};

export function CourseTagsEditor({
  courseId,
  tags,
  availableTags,
  isLoading = false,
  layout = "vertical",
}: CourseTagsEditorProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(() =>
    tags.map((tag) => tag.id),
  );

  const updateCourseTags = useUpdateCourseTagsMutation();
  const createTag = useCreateTagMutation();

  const originalIds = tags.map((tag) => tag.id);

  const hasChanges =
    selectedTagIds.length !== originalIds.length ||
    selectedTagIds.some((id) => !originalIds.includes(id));

  const isSaving = updateCourseTags.isPending || createTag.isPending;

  const save = async () => {
    try {
      await updateCourseTags.mutateAsync({
        id: courseId,
        tagIds: selectedTagIds,
      });

      toast.success("Tags saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save tags.",
      );
    }
  };

  return (
    <section>
      <CreatableMultiSelect
        label="Tags"
        placeholder="Select or create tags"
        searchPlaceholder="Search or enter a tag..."
        createLabel="Create tag"
        items={availableTags}
        selectedIds={selectedTagIds}
        onSelectedIdsChange={setSelectedTagIds}
        onCreate={(name) => createTag.mutateAsync(name)}
        isLoading={isLoading}
        isCreating={createTag.isPending}
        disabled={isSaving}
        layout={layout}
      />
      <div className="mb-2 flex items-center justify-between gap-2">
        {hasChanges && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Discard tag changes"
              disabled={isSaving}
              onClick={() => setSelectedTagIds(originalIds)}
            >
              <X />
            </Button>

            <Button
              type="button"
              size="icon-xs"
              aria-label="Save tag changes"
              disabled={isSaving || isLoading}
              onClick={() => void save()}
            >
              <Save />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
