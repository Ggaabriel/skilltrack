import { graphqlClient } from "@/shared/api";

import type { Course } from "./types";

type CoursesQuery = {
  courses: {
    ok: boolean;
    status: number;
    message: string;
    data: Course[];
  };
};

const COURSES_QUERY = `
  query Courses {
    courses {
      ok
      status
      message
      data {
        id
        title
        description
        type
        cover
        createdAt
        updatedAt
      }
    }
  }
`;

export const courseApi = {
  getCourses() {
    return graphqlClient.request<CoursesQuery>(COURSES_QUERY);
  },
};