import { normalizeApolloError } from '../../app.module';

describe('normalizeApolloError', () => {
  it('uses the standard error response fields and omits internal details', () => {
    expect(
      normalizeApolloError({
        message: 'Course not found',
        extensions: {
          status: 404,
          response: { details: 'internal' },
          stacktrace: ['internal stack'],
        },
      }),
    ).toEqual({
      message: 'Course not found',
      ok: false,
      status: 404,
    });
  });

  it('uses HTTP-like status codes for GraphQL validation and auth errors', () => {
    expect(
      normalizeApolloError({
        message: 'Invalid query',
        extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
      }).status,
    ).toBe(400);

    expect(
      normalizeApolloError({
        message: 'Authentication required',
        extensions: { code: 'UNAUTHENTICATED' },
      }).status,
    ).toBe(401);
  });
});
