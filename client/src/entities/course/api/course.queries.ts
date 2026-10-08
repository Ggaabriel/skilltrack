import { useQuery } from "@tanstack/react-query";

import { courseApi } from "./course.api";

export const courseQueryKeys = {
  all: ["courses"] as const,

  list: () => [...courseQueryKeys.all, "list"] as const,

  detail: (id: string) =>
    [...courseQueryKeys.all, "detail", id] as const,
};

export function useCoursesQuery() {
  return useQuery({
    queryKey: courseQueryKeys.list(),
    queryFn: courseApi.getCourses,
  });
}

export function useCourseQuery(id: string) {
  return useQuery({
    queryKey: courseQueryKeys.detail(id),
    queryFn: () => courseApi.getCourse(id),
    enabled: Boolean(id),
  });
}