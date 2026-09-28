export interface GraphqlResponse<T> {
  ok: boolean;
  status: number;
  message: string;
  data: T;
}

export function graphqlSuccess<T>(data: T): GraphqlResponse<T> {
  return {
    ok: true,
    status: 200,
    message: 'success',
    data,
  };
}
