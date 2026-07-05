export const Routes = {
  BASE: "/",
  CALENDAR: "/calendar",
} as const;

export type Page = (typeof Routes)[keyof typeof Routes];