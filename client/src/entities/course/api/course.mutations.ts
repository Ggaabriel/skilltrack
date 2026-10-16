import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlClient } from "@/shared/api";

import { courseQueryKeys } from "./course.queries";
import type { Course } from "./types";

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

async function updateCourseTags(
  id: string,
  tagIds: number[],
): Promise<Course> {
  const response =
    await graphqlClient.request<UpdateCourseTagsResponse>(
      UPDATE_COURSE_TAGS_MUTATION,
      {
        id,
        tagIds,
      },
    );

  return response.updateCourseTags.data;
}

async function updateCourseSkills(
  id: string,
  skillIds: number[],
): Promise<Course> {
  const response =
    await graphqlClient.request<UpdateCourseSkillsResponse>(
      UPDATE_COURSE_SKILLS_MUTATION,
      {
        id,
        skillIds,
      },
    );

  return response.updateCourseSkills.data;
}

export function useUpdateCourseTagsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      tagIds,
    }: {
      id: string;
      tagIds: number[];
    }) => updateCourseTags(id, tagIds),

    onSuccess: (course) => {
      queryClient.setQueryData(
        courseQueryKeys.detail(course.id),
        course,
      );

      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.list(),
      });
    },
  });
}

export function useUpdateCourseSkillsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      skillIds,
    }: {
      id: string;
      skillIds: number[];
    }) => updateCourseSkills(id, skillIds),

    onSuccess: (course) => {
      queryClient.setQueryData(
        courseQueryKeys.detail(course.id),
        course,
      );

      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.list(),
      });
    },
  });
}