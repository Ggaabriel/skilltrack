export const Routes = {
  BASE: "/",
  CALENDAR: "/calendar",
  SETTINGS: "/settings",
  COURSES: "/courses",
  COURSE_BUILDER: "/courses/:courseId/builder",
} as const;

export type Page = (typeof Routes)[keyof typeof Routes];
