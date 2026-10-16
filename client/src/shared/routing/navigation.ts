import { Routes } from "./routes";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export type PageNavigation = {
  breadcrumbs: BreadcrumbItem[];
  fallbackTo?: string;
};

export function getPageNavigation(pathname: string): PageNavigation {
  if (/^\/courses\/[^/]+\/builder\/?$/.test(pathname)) {
    return {
      breadcrumbs: [
        { label: "Courses", to: Routes.COURSES },
        { label: "Course builder" },
      ],
      fallbackTo: Routes.COURSES,
    };
  }

  switch (pathname) {
    case Routes.CALENDAR:
      return { breadcrumbs: [{ label: "Calendar" }] };
    case Routes.COURSES:
      return { breadcrumbs: [{ label: "Courses" }] };
    case Routes.SETTINGS:
      return { breadcrumbs: [{ label: "Settings" }] };
    default:
      return { breadcrumbs: [{ label: "SkillTrack" }] };
  }
}
