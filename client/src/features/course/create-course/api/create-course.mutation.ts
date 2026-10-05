import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlClient } from "@/shared/api";
import { courseQueryKeys } from "@/entities/course/api/course.queries";

import type { CreateCourseFormValues } from "../model/schemas";
import type { Course } from "@/entities/course/api/types";

type CreateCourseMutationResponse = {
  createCourse: {
    ok: boolean;
    status: number;
    message: string;
    data: Course;
  };
};

const CREATE_COURSE_MUTATION = `
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
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

async function createCourse(values: CreateCourseFormValues): Promise<Course> {
  const response = await graphqlClient.request<CreateCourseMutationResponse>(
    CREATE_COURSE_MUTATION,
    {
      input: {
        title: values.title,
        description: values.description || undefined,
        type: values.type,
      },
    },
  );

  return response.createCourse.data;
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: courseQueryKeys.all,
      });
    },
  });
}