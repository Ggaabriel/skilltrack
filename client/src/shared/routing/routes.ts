export const Routes = {
  BASE: "/",
  PROFILE: "/profile",
  USER_PROFILE: "/users/:userId",
  CALENDAR: "/calendar",
  SETTINGS: "/settings",
  COURSES: "/courses",
  COURSE_BUILDER: "/courses/:courseId/builder",
  COURSE_READER: "/courses/:courseId/read",
} as const;

export type Page = (typeof Routes)[keyof typeof Routes];
