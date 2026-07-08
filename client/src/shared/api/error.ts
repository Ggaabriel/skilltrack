export type ApiErrorCode =
  | "NETWORK"
  | "TIMEOUT"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "SERVER"
  | "UNKNOWN";

const STATUS_MAP: Record<number, ApiErrorCode> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION",
};

const ERROR_CONFIG: Record<
  ApiErrorCode,
  { layer: "expected" | "operational" | "bug"; defaultMessage: string }
> = {
  BAD_REQUEST: { layer: "expected", defaultMessage: "Bad request." },
  UNAUTHORIZED: {
    layer: "expected",
    defaultMessage: "Authentication required.",
  },
  FORBIDDEN: { layer: "expected", defaultMessage: "Access forbidden." },
  NOT_FOUND: { layer: "expected", defaultMessage: "Resource not found." },
  CONFLICT: { layer: "expected", defaultMessage: "Conflict detected." },
  VALIDATION: { layer: "expected", defaultMessage: "Validation failed." },
  NETWORK: {
    layer: "operational",
    defaultMessage: "Network connection failed.",
  },
  TIMEOUT: { layer: "operational", defaultMessage: "Request timed out." },
  SERVER: { layer: "operational", defaultMessage: "Server error occurred." },
  UNKNOWN: { layer: "bug", defaultMessage: "An unknown error occurred." },
};

export function codeFromStatus(status: number): ApiErrorCode {
  if (status >= 500) {
    return "SERVER";
  }

  return STATUS_MAP[status] ?? "UNKNOWN";
}

export interface ApiErrorInit {
  status: number;
  code?: ApiErrorCode;
  message?: string;
  payload?: unknown;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly payload?: unknown;

  constructor(init: ApiErrorInit) {
    const code = init.code ?? codeFromStatus(init.status);
    const message = init.message ?? ERROR_CONFIG[code].defaultMessage;

    super(message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = code;

    if (init.payload !== undefined) {
      this.payload = init.payload;
    }
    if (init.cause !== undefined) {
      this.cause = init.cause;
    }
  }
}

export function reportApiError(
  err: ApiError,
  context?: Record<string, unknown>,
): void {
  if (context?.handled === true) {
    return;
  }

  const payload = {
    ...context,
    status: err.status,
    code: err.code,
  };

  const layer = ERROR_CONFIG[err.code]?.layer ?? "bug";

  if (layer === "expected") {
    console.warn("API Warning:", err.message, payload);
    return;
  }

  console.error("API Error:", err.message, payload);
}

export async function toApiError(response: Response): Promise<ApiError> {
  const payload = await readErrorPayload(response);
  return new ApiError({
    status: response.status,
    code: codeFromStatus(response.status),
    message: extractMessage(payload, response.status),
    payload,
  });
}

function readErrorPayload(response: Response): Promise<unknown> {
  return response
    .clone()
    .json()
    .catch(() => response.clone().text())
    .catch(() => undefined);
}

function extractMessage(payload: unknown, status: number): string {
  if (hasStringMessage(payload)) {
    return payload.message;
  }
  return `HTTP ${status}`;
}

function hasStringMessage(payload: unknown): payload is { message: string } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof (payload as { message: unknown }).message === "string"
  );
}
