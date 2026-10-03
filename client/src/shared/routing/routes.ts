export const Routes = {
  BASE: "/",
  CALENDAR: "/calendar",
  SETTINGS: "/settings",
  COURSES: "/courses",
} as const;

export type Page = (typeof Routes)[keyof typeof Routes];
