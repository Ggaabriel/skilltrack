import { CheckCircle2, Eye, LoaderCircle, Pencil } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import type { CourseSkill, CourseTag } from "@/entities/course/api/types";
import type { Skill } from "@/entities/skill/api/skill.api";
import type { Tag } from "@/entities/tag/api/tag.api";
import { Routes } from "@/shared/routing/routes";
import { CourseMetadataEditor } from "./course-metadata-editor";

type CourseHeaderProps = {
  courseId: string;
  title: string;
  description?: string | null;
  courseType: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  courseTags: CourseTag[];
  courseSkills: CourseSkill[];
  availableTags: Tag[];
  availableSkills: Skill[];
  isTagsLoading: boolean;
  isSkillsLoading: boolean;
  hasNodes: boolean;
  isPublished: boolean;
  isPublishing: boolean;
  onEdit: () => void;
  onPublish: () => void;
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
  hasNodes,
  isPublished,
  isPublishing,
  onEdit,
  onPublish,
}: CourseHeaderProps) {
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

          {isPublished ? (
            <>
              <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                Published
              </span>
              <Button asChild size="sm" variant="outline">
                <Link to={Routes.COURSE_READER.replace(":courseId", courseId)}>
                  <Eye />
                  View course
                </Link>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onPublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <CheckCircle2 />
              )}
              Finish and publish
            </Button>
          )}

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
    </header>
  );
}
