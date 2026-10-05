import { useQuery } from "@tanstack/react-query";

import { courseApi } from "./course.api";

export const courseQueryKeys = {
  all: ["courses"] as const,
};

export function useCoursesQuery() {
  return useQuery({
    queryKey: courseQueryKeys.all,
    queryFn: courseApi.getCourses,
    select: (response) => response.courses.data,
  });
}