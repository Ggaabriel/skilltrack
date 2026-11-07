import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlClient } from "@/shared/api";

import { courseQueryKeys } from "./course.queries";
import { normalizeCourseRelations, type Course } from "./types";

type DeleteCourseResponse = {
  deleteCourse: {
    ok: boolean;
    status: number;
    message: string;
    data: boolean;
  };
};

type UpdateCourseMetadataResponse = {
  updateCourseTags?: {
    ok: boolean;
    status: number;
    message: string;
    data: Course;
  };
  updateCourseSkills?: {
    ok: boolean;
    status: number;
    message: string;
    data: Course;
  };
};

type UpdateCourseInput = {
  title: string;
  description: string;
};

type UpdateCourseResponse = {
  updateCourse: {
    ok: boolean;
    status: number;
    message: string;
    data: Course;
  };
};

type PublishCourseResponse = {
  publishCourse: {
    ok: boolean;
    status: number;
    message: string;
    data: Course;
  };
};

const DELETE_COURSE_MUTATION = `
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id) {
      ok
      status
      message
      data
    }
  }
`;

const UPDATE_COURSE_TAGS_MUTATION = `
  mutation UpdateCourseTags($id: ID!, $tagIds: [Int!]!) {
    updateCourseTags(id: $id, tagIds: $tagIds) {
      ok
      status
      message
      data {
        id title description type cover isPublished publishedAt createdAt updatedAt
        tags { id name }
        skills { id name }
      }
    }
  }
`;

const UPDATE_COURSE_SKILLS_MUTATION = `
  mutation UpdateCourseSkills($id: ID!, $skillIds: [Int!]!) {
    updateCourseSkills(id: $id, skillIds: $skillIds) {
      ok
      status
      message
      data {
        id title description type cover isPublished publishedAt createdAt updatedAt
        tags { id name }
        skills { id name }
      }
    }
  }
`;

const UPDATE_COURSE_MUTATION = `
  mutation UpdateCourse(
    $id: ID!
    $input: UpdateCourseInput!
  ) {
    updateCourse(
      id: $id
      input: $input
    ) {
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

const PUBLISH_COURSE_MUTATION = `
  mutation PublishCourse($id: ID!) {
    publishCourse(id: $id) {
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
        tags { id name }
        skills { id name }
      }
    }
  }
`;

function refreshCourseQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  course: Course,
) {
  queryClient.setQueryData(courseQueryKeys.detail(course.id), course);

  return Promise.all([
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.list() }),
    queryClient.invalidateQueries({
      queryKey: courseQueryKeys.publishedList(),
    }),
    queryClient.invalidateQueries({
      queryKey: courseQueryKeys.publishedDetail(course.id),
    }),
  ]);
}

async function deleteCourse(id: string): Promise<string> {
  const response = await graphqlClient.request<DeleteCourseResponse>(
    DELETE_COURSE_MUTATION,
    { id },
  );

  if (!response.deleteCourse.data) {
    throw new Error(
      response.deleteCourse.message || "Failed to delete course.",
    );
  }

  return id;
}

function normalizeIds(ids: number[]): number[] {
  const normalizedIds = ids.map(Number);
  if (!normalizedIds.every(Number.isSafeInteger)) {
    throw new Error("Tag and skill identifiers must be integers.");
  }
  return [...new Set(normalizedIds)];
}

async function updateCourseMetadata(
  kind: "tags" | "skills",
  id: string,
  ids: number[],
): Promise<Course> {
  const mutation =
    kind === "tags"
      ? UPDATE_COURSE_TAGS_MUTATION
      : UPDATE_COURSE_SKILLS_MUTATION;
  const response = await graphqlClient.request<UpdateCourseMetadataResponse>(
    mutation,
    kind === "tags"
      ? { id, tagIds: normalizeIds(ids) }
      : { id, skillIds: normalizeIds(ids) },
  );
  const result =
    kind === "tags" ? response.updateCourseTags : response.updateCourseSkills;

  if (!result?.ok) {
    throw new Error(result?.message || `Failed to update course ${kind}.`);
  }

  return normalizeCourseRelations(result.data);
}

export function useUpdateCourseTagsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tagIds }: { id: string; tagIds: number[] }) =>
      updateCourseMetadata("tags", id, tagIds),
    onSuccess: (course) => refreshCourseQueries(queryClient, course),
  });
}

export function useUpdateCourseSkillsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, skillIds }: { id: string; skillIds: number[] }) =>
      updateCourseMetadata("skills", id, skillIds),
    onSuccess: (course) => refreshCourseQueries(queryClient, course),
  });
}

export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: courseQueryKeys.detail(id) });
      queryClient.setQueryData<Course[]>(courseQueryKeys.list(), (courses) =>
        courses?.filter((course) => course.id !== id),
      );
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.publishedList(),
      });
    },
  });
}

async function updateCourse(
  id: string,
  input: UpdateCourseInput,
): Promise<Course> {
  const response = await graphqlClient.request<UpdateCourseResponse>(
    UPDATE_COURSE_MUTATION,
    { id, input },
  );

  const result = response.updateCourse;

  if (!result.ok) {
    throw new Error(result.message || "Failed to update course.");
  }

  return normalizeCourseRelations(result.data);
}
export function useUpdateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCourseInput }) =>
      updateCourse(id, input),

    onSuccess: (course) => refreshCourseQueries(queryClient, course),
  });
}

export function usePublishCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await graphqlClient.request<PublishCourseResponse>(
        PUBLISH_COURSE_MUTATION,
        { id },
      );
      if (!response.publishCourse.ok) {
        throw new Error(
          response.publishCourse.message || "Failed to publish course.",
        );
      }
      return normalizeCourseRelations(response.publishCourse.data);
    },
    onSuccess: (course) => refreshCourseQueries(queryClient, course),
  });
}
