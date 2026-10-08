export type CourseType =
  | "QUICK_NOTE"
  | "STEP_BY_STEP"
  | "FREE_FORM";

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