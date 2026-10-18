import { Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUpdateCourseSkillsMutation } from "@/entities/course/api/course.mutations";
import type { Skill } from "@/entities/skill/api/skill.api";
import { useCreateSkillMutation } from "@/entities/skill/api/skill.mutations";
import { CreatableMultiSelect } from "@/features/course/create-course";
import type { CreatableMultiSelectLayout } from "../../create-course/ui/creatable-multi-select";

type CourseSkillsEditorProps = {
  courseId: string;
  skills: Pick<Skill, "id" | "name">[];
  availableSkills: Skill[];
  isLoading?: boolean;
  layout?: CreatableMultiSelectLayout;
};

export function CourseSkillsEditor({
  courseId,
  skills,
  availableSkills,
  isLoading = false,
  layout = "vertical",
}: CourseSkillsEditorProps) {
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>(() =>
    skills.map((skill) => skill.id),
  );

  const updateCourseSkills = useUpdateCourseSkillsMutation();
  const createSkill = useCreateSkillMutation();

  const originalIds = skills.map((skill) => skill.id);
  const originalIdSet = new Set(originalIds);

  const hasChanges =
    selectedSkillIds.length !== originalIds.length ||
    selectedSkillIds.some((id) => !originalIdSet.has(id));

  const isSaving = updateCourseSkills.isPending || createSkill.isPending;

  async function save() {
    try {
      await updateCourseSkills.mutateAsync({
        id: courseId,
        skillIds: selectedSkillIds,
      });

      toast.success("Skills saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save skills.",
      );
    }
  }

  return (
    <section>
      <CreatableMultiSelect
        label="Skills"
        placeholder="Select or create skills"
        searchPlaceholder="Search or enter a skill..."
        createLabel="Create skill"
        items={availableSkills}
        selectedIds={selectedSkillIds}
        onSelectedIdsChange={setSelectedSkillIds}
        onCreate={(name) => createSkill.mutateAsync(name)}
        isLoading={isLoading}
        isCreating={createSkill.isPending}
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
              aria-label="Discard skill changes"
              disabled={isSaving}
              onClick={() => setSelectedSkillIds(originalIds)}
            >
              <X />
            </Button>

            <Button
              type="button"
              size="icon-xs"
              aria-label="Save skill changes"
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
