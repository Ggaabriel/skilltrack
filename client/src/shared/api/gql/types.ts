export type GraphQLRequestVariables = Record<string, unknown>;

export type GraphQLErrorExtensions = {
  code?: string;
  status?: number;
  statusCode?: number;
  originalError?: {
    status?: number;
    statusCode?: number;
    message?: string;
  };
  [key: string]: unknown;
};

export type GraphQLError = {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: GraphQLErrorExtensions;
};

export type GraphQLResponse<TData> = {
  data?: TData | null;
  errors?: GraphQLError[];
};