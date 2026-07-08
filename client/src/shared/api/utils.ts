export function isRawBody(
  body: unknown
): body is BodyInit {
  return (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    typeof body === 'string'
  );
}

export function serializeBody(body: unknown) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isRawBody(body)) {
    return body;
  }

  return JSON.stringify(body);
}