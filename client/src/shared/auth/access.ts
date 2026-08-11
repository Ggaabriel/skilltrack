export const Access = {
  AUTHENTICATED: "authenticated",
  GUEST: "guest",
} as const;
export type Access = (typeof Access)[keyof typeof Access];