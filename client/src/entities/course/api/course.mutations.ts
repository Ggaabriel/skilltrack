import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlClient } from "@/shared/api";

import { courseQueryKeys } from "./course.queries";
import { normalizeCourseRelations, type Course } from "./types";

type UpdateCourseTagsResponse = {
  updateCourseTags: {
    ok: boolean;
    status: number;
    message: string;
    data: Course;
  };
};

type UpdateCourseSkillsResponse = {
  updateCourseSkills: {
    ok: boolean;
    status: number;
    message: string;
    data: Course;
  };
};

type DeleteCourseResponse = {
  deleteCourse: {
    ok: boolean;
    status: number;
    message: string;
    data: boolean;
  };
};

const UPDATE_COURSE_TAGS_MUTATION = `
  mutation UpdateCourseTags(
    $id: ID!
    $tagIds: [Int!]!
  ) {
    updateCourseTags(
      id: $id
      tagIds: $tagIds
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

const UPDATE_COURSE_SKILLS_MUTATION = `
  mutation UpdateCourseSkills(
    $id: ID!
    $skillIds: [Int!]!
  ) {
    updateCourseSkills(
      id: $id
      skillIds: $skillIds
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

async function updateCourseTags(id: string, tagIds: number[]): Promise<Course> {
  const response = await graphqlClient.request<UpdateCourseTagsResponse>(
    UPDATE_COURSE_TAGS_MUTATION,
    {
      id,
      tagIds: toIntegerIds(tagIds),
    },
  );

  return normalizeCourseRelations(response.updateCourseTags.data);
}

async function updateCourseSkills(
  id: string,
  skillIds: number[],
): Promise<Course> {
  const response = await graphqlClient.request<UpdateCourseSkillsResponse>(
    UPDATE_COURSE_SKILLS_MUTATION,
    {
      id,
      skillIds: toIntegerIds(skillIds),
    },
  );

  return normalizeCourseRelations(response.updateCourseSkills.data);
}

function toIntegerIds(ids: number[]): number[] {
  const normalizedIds = ids.map(Number);

  if (!normalizedIds.every(Number.isSafeInteger)) {
    throw new Error("Tag and skill identifiers must be integers.");
  }

  return [...new Set(normalizedIds)];
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

export function useUpdateCourseTagsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tagIds }: { id: string; tagIds: number[] }) =>
      updateCourseTags(id, tagIds),

    onSuccess: (course) => {
      queryClient.setQueryData(courseQueryKeys.detail(course.id), course);

      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.list(),
      });
    },
  });
}

export function useUpdateCourseSkillsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, skillIds }: { id: string; skillIds: number[] }) =>
      updateCourseSkills(id, skillIds),

    onSuccess: (course) => {
      queryClient.setQueryData(courseQueryKeys.detail(course.id), course);

      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.list(),
      });
    },
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
    },
  });
}
