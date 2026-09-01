export const Routes = {
  BASE: "/",
  CALENDAR: "/calendar",
  SETTINGS: "/settings",
} as const;

export type Page = (typeof Routes)[keyof typeof Routes];