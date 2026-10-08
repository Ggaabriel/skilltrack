import { graphqlClient } from "@/shared/api";

import type { Course } from "./types";

type CoursesQueryResponse = {
  courses: {
    ok: boolean;
    status: number;
    message: string;
    data: Course[];
  };
};

type CourseQueryResponse = {
  course: {
    ok: boolean;
    status: number;
    message: string;
    data: Course;
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
        tags {
          id
          name
        }
        skills {
          id
          name
        }
      }
    }
  }
`;

const COURSE_QUERY = `
  query Course($id: ID!) {
    course(id: $id) {
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
        tags {
          id
          name
        }
        skills {
          id
          name
        }
      }
    }
  }
`;

export const courseApi = {
  async getCourses(): Promise<Course[]> {
    const response =
      await graphqlClient.request<CoursesQueryResponse>(
        COURSES_QUERY,
      );

    return response.courses.data;
  },

  async getCourse(id: string): Promise<Course> {
    const response =
      await graphqlClient.request<CourseQueryResponse>(
        COURSE_QUERY,
        { id },
      );

    return response.course.data;
  },
};