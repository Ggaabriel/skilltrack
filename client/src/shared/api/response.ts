export async function parseResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}
