import { httpClient } from "@/shared/api";
import { ApiError } from "../error";

import type {
  GraphQLError,
  GraphQLRequestVariables,
  GraphQLResponse,
} from "./types";

export const graphqlClient = {
  async request<TData>(
    query: string,
    variables?: GraphQLRequestVariables,
  ): Promise<TData> {
    const response = await httpClient.post<GraphQLResponse<TData>>(
      "/graphql",
      {
        query,
        variables,
      },
    );

    if (response.errors?.length) {
      throw createGraphQLError(response.errors, response);
    }

    if (response.data == null) {
      throw new ApiError({
        status: 200,
        code: "GRAPHQL",
        message: "GraphQL response does not contain data.",
        payload: response,
      });
    }

    return response.data;
  },
};

function createGraphQLError<TData>(
  errors: GraphQLError[],
  response: GraphQLResponse<TData>,
): ApiError {
  const firstError = errors[0];

  return new ApiError({
    status: getGraphQLStatus(firstError) ?? 200,
    code: "GRAPHQL",
    message: errors.map((error) => error.message).join("; "),
    payload: {
      errors,
      data: response.data,
    },
  });
}

function getGraphQLStatus(error: GraphQLError): number | undefined {
  const extensions = error.extensions;

  if (!extensions) {
    return undefined;
  }

  if (typeof extensions.status === "number") {
    return extensions.status;
  }

  if (typeof extensions.statusCode === "number") {
    return extensions.statusCode;
  }

  if (
    extensions.originalError &&
    typeof extensions.originalError.statusCode === "number"
  ) {
    return extensions.originalError.statusCode;
  }

  if (
    extensions.originalError &&
    typeof extensions.originalError.status === "number"
  ) {
    return extensions.originalError.status;
  }

  return undefined;
}