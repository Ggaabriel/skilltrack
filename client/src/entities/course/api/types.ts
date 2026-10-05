export type CourseType = "QUICK_NOTE" | "STEP_BY_STEP" | "FREE_FORM";

export type Course = {
  id: string;
  title: string;
  description: string | null;
  type: CourseType;
  cover: string | null;
  createdAt: string;
  updatedAt: string;
};