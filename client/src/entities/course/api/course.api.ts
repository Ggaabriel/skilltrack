import { graphqlClient } from "@/shared/api";

import {
  normalizeCourseRelations,
  type Course,
  type CourseAuthor,
} from "./types";
import type { CourseNode } from "@/entities/node";

export type PublishedCourse = Course & {
  author: CourseAuthor;
  nodes: CourseNode[];
};

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

type PublishedCoursesQueryResponse = {
  publishedCourses: { data: Course[] };
};

type PublishedCourseQueryResponse = {
  publishedCourse: {
    data: Course & {
      author: CourseAuthor;
      nodes: CourseNode[];
    };
  };
};

const AUTHOR_FIELDS = `
  author {
    id
    name
    picturePath
  }
`;

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
        isPublished
        publishedAt
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
        isPublished
        publishedAt
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

const PUBLISHED_COURSES_QUERY = `
  query PublishedCourses {
    publishedCourses {
      data {
        id
        title
        description
        type
        cover
        isPublished
        publishedAt
        createdAt
        updatedAt
        ${AUTHOR_FIELDS}
        tags { id name }
        skills { id name }
      }
    }
  }
`;

const NODE_FIELDS = `
  id title content position courseId parentId createdAt updatedAt
`;

function buildNodeTree(nodes: CourseNode[]): CourseNode[] {
  const treeNodes: CourseNode[] = nodes.map((node) => ({
    ...node,
    parentId: node.parentId == null ? null : Number(node.parentId),
    children: [],
  }));
  const nodesById = new Map(treeNodes.map((node) => [node.id, node]));
  const roots: CourseNode[] = [];

  for (const node of treeNodes) {
    const parent =
      node.parentId == null ? undefined : nodesById.get(String(node.parentId));
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

const PUBLISHED_COURSE_QUERY = `
  query PublishedCourse($id: ID!) {
    publishedCourse(id: $id) {
      data {
        id
        title
        description
        type
        cover
        isPublished
        publishedAt
        createdAt
        updatedAt
        ${AUTHOR_FIELDS}
        tags { id name }
        skills { id name }
        nodes { ${NODE_FIELDS} }
      }
    }
  }
`;

export const courseApi = {
  async getCourses(): Promise<Course[]> {
    const response =
      await graphqlClient.request<CoursesQueryResponse>(COURSES_QUERY);

    return response.courses.data.map(normalizeCourseRelations);
  },

  async getCourse(id: string): Promise<Course> {
    const response = await graphqlClient.request<CourseQueryResponse>(
      COURSE_QUERY,
      { id },
    );

    return normalizeCourseRelations(response.course.data);
  },

  async getPublishedCourses(): Promise<Course[]> {
    const response = await graphqlClient.request<PublishedCoursesQueryResponse>(
      PUBLISHED_COURSES_QUERY,
    );
    return response.publishedCourses.data.map(normalizeCourseRelations);
  },

  async getPublishedCourse(id: string): Promise<PublishedCourse> {
    const response = await graphqlClient.request<PublishedCourseQueryResponse>(
      PUBLISHED_COURSE_QUERY,
      { id },
    );
    const publishedCourse = response.publishedCourse.data;
    return {
      ...normalizeCourseRelations(publishedCourse),
      author: publishedCourse.author,
      nodes: buildNodeTree(publishedCourse.nodes),
    };
  },
};
