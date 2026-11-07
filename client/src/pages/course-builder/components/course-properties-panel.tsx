import type { CourseSkill, CourseTag } from "@/entities/course/api/types";
import type { Skill } from "@/entities/skill/api/skill.api";
import type { Tag } from "@/entities/tag/api/tag.api";
import { CourseMetadataEditor } from "./course-metadata-editor";

type CoursePropertiesPanelProps = {
  courseId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  courseTags: CourseTag[];
  courseSkills: CourseSkill[];
  availableTags: Tag[];
  availableSkills: Skill[];
  isTagsLoading: boolean;
  isSkillsLoading: boolean;
  hasNodes: boolean;
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
  hasNodes,
}: CoursePropertiesPanelProps) {
  return (
    <aside className="space-y-5 p-4 text-sm">
      <div>
        <h2 className="mb-2 font-medium">Properties</h2>
        <p className="text-muted-foreground">
          Created {formatDate(createdAt).toLocaleDateString()}
        </p>
      </div>

      <CourseMetadataEditor
        key={`${courseId}:${courseTags
          .map(({ id }) => id)
          .sort()
          .join(",")}:${courseSkills
          .map(({ id }) => id)
          .sort()
          .join(",")}`}
        courseId={courseId}
        tags={courseTags}
        skills={courseSkills}
        availableTags={availableTags}
        availableSkills={availableSkills}
        isTagsLoading={isTagsLoading}
        isSkillsLoading={isSkillsLoading}
        disabled={!hasNodes}
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
