export type ApiResponse<T> = {
  data: T;
  message: string;
  ok: boolean;
  status: number;
  meta?: {
    page?: number;
    total?: number;
    lastPage?: number;
  };
};
