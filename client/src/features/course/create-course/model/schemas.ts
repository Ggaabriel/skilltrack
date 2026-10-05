import { z } from "zod";

export const courseTypeValues = [
  "QUICK_NOTE",
  "STEP_BY_STEP",
  "FREE_FORM",
] as const;

export const createCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(100, "Title must be 100 characters or less."),

  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or less."),

  type: z.enum(courseTypeValues),
});

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;