export type CourseType = "QUICK_NOTE" | "STEP_BY_STEP" | "FREE_FORM";

export type CourseTag = {
  id: number;
  name: string;
};

export type CourseSkill = {
  id: number;
  name: string;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  type: CourseType;
  cover: string | null;
  tags: CourseTag[];
  skills: CourseSkill[];
  createdAt: string;
  updatedAt: string;
};

export function normalizeCourseRelations(course: Course): Course {
  return {
    ...course,
    tags: course.tags.map((tag) => ({ ...tag, id: Number(tag.id) })),
    skills: course.skills.map((skill) => ({ ...skill, id: Number(skill.id) })),
  };
}
