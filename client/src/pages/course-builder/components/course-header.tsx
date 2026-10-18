import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CourseTag } from "@/entities/course/api/types";
import type { Tag } from "@/entities/tag/api/tag.api";
import type { Skill } from "@/entities/skill/api/skill.api";
import { CourseTagsEditor } from "@/features/course/edit-course-tags";
import { CourseSkillsEditor } from "@/features/course/edit-course-skills/ui/course-skill-editor";

type CourseHeaderProps = {
  courseId: string;
  title: string;
  description?: string | null;
  courseType: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  courseTags: CourseTag[];
  courseSkills: Pick<Skill, "id" | "name">[];
  availableTags: Tag[];
  availableSkills: Skill[];
  isTagsLoading: boolean;
  isSkillsLoading: boolean;
  onEdit: () => void;
};

function formatDate(value: string | Date) {
  return new Date(value instanceof Date ? value.getTime() : value);
}

export function CourseHeader({
  courseId,
  title,
  description,
  courseType,
  createdAt,
  updatedAt,
  courseTags,
  courseSkills,
  availableTags,
  availableSkills,
  isTagsLoading,
  isSkillsLoading,
  onEdit,
}: CourseHeaderProps) {
  const tagKey = courseTags
    .map((tag) => tag.id)
    .sort((a, b) => a - b)
    .join(",");

  const skillKey = courseSkills
    .map((skill) => skill.id)
    .sort((a, b) => a - b)
    .join(",");

  return (
    <header className="grid gap-4 border-b pb-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,560px)]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="break-words text-2xl font-semibold tracking-tight">
            {title}
          </h1>

          <Button type="button" size="sm" variant="ghost" onClick={onEdit}>
            <Pencil className="size-3.5" />
            Edit details
          </Button>

          <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {courseType}
          </span>
        </div>

        {description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Created {formatDate(createdAt).toLocaleDateString()}</span>

          <span>Updated {formatDate(updatedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <CourseTagsEditor
            layout="horizontal"
            key={`${courseId}:${tagKey}`}
            courseId={courseId}
            tags={courseTags}
            availableTags={availableTags}
            isLoading={isTagsLoading}
          />
        </div>

        <div className="min-w-0">
          <CourseSkillsEditor
            layout="horizontal"
            key={`${courseId}:${skillKey}`}
            courseId={courseId}
            skills={courseSkills}
            availableSkills={availableSkills}
            isLoading={isSkillsLoading}
          />
        </div>
      </div>
    </header>
  );
}
