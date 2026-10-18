import type { CourseTag } from "@/entities/course/api/types";
import type { Tag } from "@/entities/tag/api/tag.api";
import type { Skill } from "@/entities/skill/api/skill.api";
import { CourseTagsEditor } from "@/features/course/edit-course-tags";
import { CourseSkillsEditor } from "@/features/course/edit-course-skills/ui/course-skill-editor";

type CoursePropertiesPanelProps = {
  courseId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  courseTags: CourseTag[];
  courseSkills: Pick<Skill, "id" | "name">[];
  availableTags: Tag[];
  availableSkills: Skill[];
  isTagsLoading: boolean;
  isSkillsLoading: boolean;
};

function formatDate(value: string | Date) {
  return new Date(value instanceof Date ? value.getTime() : value);
}

export function CoursePropertiesPanel({
  courseId,
  createdAt,
  updatedAt,
  courseTags,
  courseSkills,
  availableTags,
  availableSkills,
  isTagsLoading,
  isSkillsLoading,
}: CoursePropertiesPanelProps) {
  const tagKey = courseTags
    .map((tag) => tag.id)
    .sort((a, b) => a - b)
    .join(",");
  const skillKey = courseSkills
    .map((skill) => skill.id)
    .sort((a, b) => a - b)
    .join(",");

  return (
    <aside className="space-y-5 p-4 text-sm">
      <div>
        <h2 className="mb-2 font-medium">Properties</h2>
        <p className="text-muted-foreground">
          Created {formatDate(createdAt).toLocaleDateString()}
        </p>
      </div>

      <CourseTagsEditor
        key={`${courseId}:${tagKey}`}
        courseId={courseId}
        tags={courseTags}
        availableTags={availableTags}
        isLoading={isTagsLoading}
      />

      <CourseSkillsEditor
        key={`${courseId}:${skillKey}`}
        courseId={courseId}
        skills={courseSkills}
        availableSkills={availableSkills}
        isLoading={isSkillsLoading}
      />

      <div>
        <h3 className="mb-2 font-medium">Last updated</h3>
        <p className="text-muted-foreground">
          {formatDate(updatedAt).toLocaleString()}
        </p>
      </div>
    </aside>
  );
}
